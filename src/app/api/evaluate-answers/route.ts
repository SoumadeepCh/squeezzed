import { NextRequest, NextResponse } from 'next/server';

interface Answer {
  questionIndex: number;
  questionType: 'mcq' | 'objective' | 'long';
  question: string;
  userAnswer: string | number;
  correctAnswer?: string | number;
  keyPoints?: string[];
  sampleAnswer?: string;
  options?: string[];
}

interface EvaluationRequest {
  answers: Answer[];
  topic: string;
}

interface EvaluationResult {
  questionIndex: number;
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
  correctAnswer?: string;
}

// Simple text similarity function
function calculateSimilarity(text1: string, text2: string): number {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const normalized1 = normalize(text1);
  const normalized2 = normalize(text2);
  
  if (normalized1 === normalized2) return 1.0;
  
  // Check for partial matches
  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);
  
  const intersection = words1.filter(word => 
    words2.some(w2 => w2.includes(word) || word.includes(w2))
  );
  
  return intersection.length / Math.max(words1.length, words2.length);
}

// Evaluate objective answers with fuzzy matching
function evaluateObjectiveAnswer(userAnswer: string, correctAnswer: string): { score: number; isCorrect: boolean; feedback: string } {
  const similarity = calculateSimilarity(userAnswer, correctAnswer);
  
  if (similarity >= 0.9) {
    return {
      score: 100,
      isCorrect: true,
      feedback: 'Excellent! Your answer is correct.'
    };
  } else if (similarity >= 0.7) {
    return {
      score: 85,
      isCorrect: true,
      feedback: `Good answer! Your response is very close to the expected answer: "${correctAnswer}"`
    };
  } else if (similarity >= 0.5) {
    return {
      score: 60,
      isCorrect: false,
      feedback: `Partially correct. Your answer has some similarity to the correct answer: "${correctAnswer}"`
    };
  } else {
    return {
      score: 20,
      isCorrect: false,
      feedback: `Incorrect. The correct answer is: "${correctAnswer}"`
    };
  }
}

// Evaluate long answers based on key points
function evaluateLongAnswer(userAnswer: string, keyPoints: string[]): { score: number; isCorrect: boolean; feedback: string } {
  if (!userAnswer || userAnswer.trim().length < 10) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'Your answer is too short. Please provide a more detailed response.'
    };
  }
  
  const userText = userAnswer.toLowerCase();
  let pointsCovered = 0;
  const feedback: string[] = [];
  
  // Check how many key points are covered
  keyPoints.forEach((point) => {
    const pointWords = point.toLowerCase().split(/\s+/);
    const covered = pointWords.some(word => userText.includes(word));
    if (covered) {
      pointsCovered++;
      feedback.push(`✓ Addressed: ${point}`);
    } else {
      feedback.push(`✗ Missing: ${point}`);
    }
  });
  
  // Calculate score based on coverage and length
  const coverageScore = (pointsCovered / keyPoints.length) * 70; // 70% for content coverage
  const lengthScore = Math.min(30, userAnswer.length / 20); // 30% for detail (roughly 1 point per 20 characters)
  const totalScore = Math.min(100, Math.round(coverageScore + lengthScore));
  
  const isCorrect = totalScore >= 60;
  
  return {
    score: totalScore,
    isCorrect,
    feedback: `Score breakdown: ${pointsCovered}/${keyPoints.length} key points covered. ${feedback.join(' • ')}`
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluationRequest = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'No answers provided' },
        { status: 400 }
      );
    }

    const results: EvaluationResult[] = [];

    // Process each answer
    for (const answer of answers) {
      let result: EvaluationResult;

      if (answer.questionType === 'mcq') {
        // MCQ questions - simple comparison
        const isCorrect = answer.userAnswer === answer.correctAnswer;
        result = {
          questionIndex: answer.questionIndex,
          isCorrect,
          score: isCorrect ? 100 : 0,
          feedback: isCorrect 
            ? 'Correct! Well done.' 
            : `Incorrect. The correct answer is: ${answer.options?.[answer.correctAnswer as number] || 'N/A'}`,
          correctAnswer: answer.options?.[answer.correctAnswer as number],
        };
      } else if (answer.questionType === 'objective') {
        // Objective questions - use fuzzy matching evaluation
        const evaluation = evaluateObjectiveAnswer(
          answer.userAnswer as string,
          answer.correctAnswer as string
        );
        result = {
          questionIndex: answer.questionIndex,
          isCorrect: evaluation.isCorrect,
          score: evaluation.score,
          feedback: evaluation.feedback,
          correctAnswer: answer.correctAnswer as string,
        };
      } else if (answer.questionType === 'long') {
        // Long answer questions - use key point evaluation
        const evaluation = evaluateLongAnswer(
          answer.userAnswer as string,
          answer.keyPoints || []
        );
        result = {
          questionIndex: answer.questionIndex,
          isCorrect: evaluation.isCorrect,
          score: evaluation.score,
          feedback: evaluation.feedback,
        };
      } else {
        result = {
          questionIndex: answer.questionIndex,
          isCorrect: false,
          score: 0,
          feedback: 'Unknown question type',
        };
      }

      results.push(result);
    }

    // Calculate overall statistics
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / results.length;
    const correctCount = results.filter(result => result.isCorrect).length;
    const totalQuestions = results.length;

    return NextResponse.json({
      results,
      summary: {
        totalQuestions,
        correctAnswers: correctCount,
        averageScore: Math.round(averageScore),
        percentage: Math.round((correctCount / totalQuestions) * 100),
      }
    });

  } catch (error) {
    console.error('Error evaluating answers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
