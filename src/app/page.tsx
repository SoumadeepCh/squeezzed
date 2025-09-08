"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import QuizConfig from "@/components/quiz/quiz-config";
import QuizContainer from "@/components/quiz/quiz-container";
import QuizResults from "@/components/quiz/quiz-results";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface QuizConfig {
  topic: string;
  questionCount: number;
  questionTypes: string[];
  difficulty: string;
  timeLimit?: number;
}

type AppState = 'config' | 'quiz' | 'results';

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

interface QuizResult {
  results: Array<{
    questionIndex: number;
    isCorrect: boolean;
    score: number;
    feedback: string;
    correctAnswer?: string;
  }>;
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
    percentage: number;
  };
  quizMetadata: {
    topic: string;
    difficulty: string;
    totalQuestions: number;
    questionsAnswered: number;
    totalTimeSpent: number;
    timeLimit: number | null;
    completedAt: string;
  };
  questionDetails: Array<{
    type: 'mcq' | 'objective' | 'long';
    question: string;
    userAnswer?: string | number;
    timeSpent: number;
    result?: {
      isCorrect: boolean;
      score: number;
      feedback: string;
    };
  }>;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('config');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuizConfig, setCurrentQuizConfig] = useState<QuizConfig | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [maxRetries] = useState(2);

  const handleStartQuiz = async (config: QuizConfig, isRetry: boolean = false) => {
    if (!isRetry) {
      setRetryAttempt(0);
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: config.topic,
          questionCount: config.questionCount,
          questionTypes: config.questionTypes,
          difficulty: config.difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error types with user-friendly messages
        if (response.status === 429) {
          const message = errorData.userFriendly || 
                         'OpenAI API quota exceeded. Please try again later or with fewer questions.';
          toast.error(message, {
            duration: 10000,
            description: 'You can try reducing the number of questions or waiting a few minutes before trying again.'
          });
          throw new Error(message);
        }
        
        if (response.status === 401) {
          const message = errorData.userFriendly || 'Authentication error with AI service';
          toast.error(message, {
            duration: 8000,
            description: 'Please contact support if this problem persists.'
          });
          throw new Error(message);
        }
        
        if (response.status >= 500) {
          const message = errorData.userFriendly || 'AI service temporarily unavailable';
          toast.error(message, {
            duration: 8000,
            description: 'Please try again in a few minutes.'
          });
          throw new Error(message);
        }
        
        // Default error handling
        const message = errorData.userFriendly || errorData.error || 'Failed to generate questions';
        throw new Error(message);
      }

      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions were generated');
      }

      setQuestions(data.questions);
      setCurrentQuizConfig(config);
      setAppState('quiz');
      toast.success(`Generated ${data.questions.length} questions successfully!`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error starting quiz:', error);
      
      // For quota errors, offer retry with fewer questions
      if (errorMessage.includes('quota') && retryAttempt < maxRetries && config.questionCount > 1) {
        const reducedCount = Math.max(1, Math.floor(config.questionCount / 2));
        setRetryAttempt(prev => prev + 1);
        
        toast.info(`Retrying with ${reducedCount} questions...`, {
          duration: 3000
        });
        
        setTimeout(() => {
          handleStartQuiz({
            ...config,
            questionCount: reducedCount
          }, true);
        }, 2000);
        
        return;
      }
      
      toast.error(errorMessage || 'Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (results: QuizResult) => {
    setQuizResults(results);
    setAppState('results');
    toast.success('Quiz completed successfully!');
  };

  const handleRetakeQuiz = () => {
    if (currentQuizConfig) {
      handleStartQuiz(currentQuizConfig);
    }
  };

  const handleNewQuiz = () => {
    setAppState('config');
    setQuestions([]);
    setCurrentQuizConfig(null);
    setQuizResults(null);
  };

  return (
    <MainLayout>
      {appState === 'config' && (
        <QuizConfig
          onStartQuiz={handleStartQuiz}
          loading={loading}
        />
      )}
      
      {appState === 'quiz' && currentQuizConfig && (
        <QuizContainer
          questions={questions}
          topic={currentQuizConfig.topic}
          difficulty={currentQuizConfig.difficulty}
          timeLimit={currentQuizConfig.timeLimit}
          onComplete={handleQuizComplete}
        />
      )}
      
      {appState === 'results' && quizResults && (
        <QuizResults
          results={quizResults}
          onRetakeQuiz={handleRetakeQuiz}
          onNewQuiz={handleNewQuiz}
        />
      )}
      
      <Toaster position="bottom-right" richColors />
    </MainLayout>
  );
}
