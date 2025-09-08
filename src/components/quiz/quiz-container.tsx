"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "./question-card";
import { toast } from "sonner";

interface MCQQuestion {
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ObjectiveQuestion {
  type: 'objective';
  question: string;
  correctAnswer: string;
  explanation: string;
}

interface LongAnswerQuestion {
  type: 'long';
  question: string;
  keyPoints: string[];
  sampleAnswer: string;
}

type Question = MCQQuestion | ObjectiveQuestion | LongAnswerQuestion;

interface Answer {
  questionIndex: number;
  answer: string | number;
  timeSpent: number;
}

interface QuizSession {
  questions: Question[];
  topic: string;
  difficulty: string;
  timeLimit?: number;
  startTime: number;
  questionStartTimes: Record<number, number>;
}

interface QuizContainerProps {
  questions: Question[];
  topic: string;
  difficulty: string;
  timeLimit?: number;
  onComplete: (results: any) => void;
}

export default function QuizContainer({
  questions,
  topic,
  difficulty,
  timeLimit,
  onComplete,
}: QuizContainerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [quizSession, setQuizSession] = useState<QuizSession>({
    questions,
    topic,
    difficulty,
    timeLimit,
    startTime: Date.now(),
    questionStartTimes: { 0: Date.now() },
  });
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(
    timeLimit ? timeLimit * 60 : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Timer effect
  useEffect(() => {
    if (!timeLimit) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === undefined) return undefined;
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit]);

  // Track question start times
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setQuizSession((prev) => ({
      ...prev,
      questionStartTimes: {
        ...prev.questionStartTimes,
        [currentQuestionIndex]: Date.now(),
      },
    }));
  }, [currentQuestionIndex]);

  const handleTimeUp = useCallback(() => {
    toast.error("Time's up! Submitting your quiz automatically.");
    handleSubmitQuiz();
  }, []);

  const handleAnswerChange = (questionIndex: number, answer: string | number) => {
    const timeSpent = Math.floor(
      (Date.now() - (quizSession.questionStartTimes[questionIndex] || Date.now())) / 1000
    );

    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        questionIndex,
        answer,
        timeSpent,
      },
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const prepareAnswersForEvaluation = () => {
    return Object.values(answers).map((answer) => {
      const question = questions[answer.questionIndex];
      
      const evaluationAnswer = {
        questionIndex: answer.questionIndex,
        questionType: question.type,
        question: question.question,
        userAnswer: answer.answer,
      };

      // Add question-specific data for evaluation
      if (question.type === 'mcq') {
        return {
          ...evaluationAnswer,
          correctAnswer: question.correctAnswer,
          options: question.options,
        };
      } else if (question.type === 'objective') {
        return {
          ...evaluationAnswer,
          correctAnswer: question.correctAnswer,
        };
      } else if (question.type === 'long') {
        return {
          ...evaluationAnswer,
          keyPoints: question.keyPoints,
          sampleAnswer: question.sampleAnswer,
        };
      }

      return evaluationAnswer;
    });
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const totalTimeSpent = Math.floor((Date.now() - quizSession.startTime) / 1000);
      const answersForEvaluation = prepareAnswersForEvaluation();
      
      if (answersForEvaluation.length === 0) {
        toast.error("Please answer at least one question before submitting.");
        setIsSubmitting(false);
        return;
      }

      // Call evaluation API
      const response = await fetch('/api/evaluate-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answersForEvaluation,
          topic: topic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answers');
      }

      const evaluationResults = await response.json();
      
      // Prepare final results
      const quizResults = {
        ...evaluationResults,
        quizMetadata: {
          topic,
          difficulty,
          totalQuestions: questions.length,
          questionsAnswered: answersForEvaluation.length,
          totalTimeSpent,
          timeLimit: timeLimit ? timeLimit * 60 : null,
          completedAt: new Date().toISOString(),
        },
        questionDetails: questions.map((question, index) => ({
          ...question,
          userAnswer: answers[index]?.answer,
          timeSpent: answers[index]?.timeSpent || 0,
          result: evaluationResults.results.find((r: any) => r.questionIndex === index),
        })),
      };

      onComplete(quizResults);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-save progress periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        localStorage.setItem('quiz-progress', JSON.stringify({
          currentQuestionIndex,
          answers,
          quizSession,
          timeRemaining,
        }));
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [currentQuestionIndex, answers, quizSession, timeRemaining]);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('quiz-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        // Only restore if it's the same quiz session
        if (progress.quizSession.topic === topic && 
            progress.quizSession.questions.length === questions.length) {
          setCurrentQuestionIndex(progress.currentQuestionIndex);
          setAnswers(progress.answers);
          setTimeRemaining(progress.timeRemaining);
          toast.success("Previous progress restored!");
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  // Warn before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers]);

  // Clear saved progress when quiz is completed
  const clearProgress = () => {
    localStorage.removeItem('quiz-progress');
  };

  // Handle quiz completion
  const handleQuizComplete = (results: any) => {
    clearProgress();
    onComplete(results);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No questions available. Please go back and try again.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent"></div>
            <span className="text-lg">Evaluating your answers...</span>
          </div>
        </div>
      )}
      
      <QuestionCard
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        timeLimit={timeLimit}
        onAnswerChange={handleAnswerChange}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handleSubmitQuiz}
        timeRemaining={timeRemaining}
      />
    </div>
  );
}
