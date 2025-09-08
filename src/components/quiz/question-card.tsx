"use client";

import { useState, useEffect } from "react";
import { AceternityCard } from "@/components/ui/aceternity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  MessageSquare,
  Clock,
  ArrowLeft,
  ArrowRight,
  Send,
} from "lucide-react";

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

interface QuestionCardProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, Answer>;
  timeLimit?: number;
  onAnswerChange: (questionIndex: number, answer: string | number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  timeRemaining?: number;
}

const questionTypeIcons = {
  mcq: CheckCircle2,
  objective: FileText,
  long: MessageSquare,
};

const questionTypeColors = {
  mcq: "bg-slate-100 text-slate-700",
  objective: "bg-gray-100 text-gray-700", 
  long: "bg-stone-100 text-stone-700",
};

const questionTypeLabels = {
  mcq: "Multiple Choice",
  objective: "Short Answer",
  long: "Long Answer",
};

export default function QuestionCard({
  questions,
  currentQuestionIndex,
  answers,
  timeLimit,
  onAnswerChange,
  onNext,
  onPrevious,
  onSubmit,
  timeRemaining,
}: QuestionCardProps) {
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  
  const currentAnswer = answers[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerChange = (answer: string | number) => {
    onAnswerChange(currentQuestionIndex, answer);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderMCQQuestion = (question: MCQQuestion) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold leading-relaxed">
          {question.question}
        </h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = currentAnswer?.answer === index;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-slate-400 bg-slate-50 shadow-md'
                      : 'border-gray-200 hover:border-slate-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswerChange(index)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-slate-500 bg-slate-500' : 'border-gray-400'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-base">{option}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderObjectiveQuestion = (question: ObjectiveQuestion) => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold leading-relaxed">
        {question.question}
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor={`answer-${currentQuestionIndex}`} className="text-base">
          Your Answer:
        </Label>
        <Input
          id={`answer-${currentQuestionIndex}`}
          placeholder="Enter your answer..."
          value={(currentAnswer?.answer as string) || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
          className="text-base"
        />
      </div>
    </div>
  );

  const renderLongAnswerQuestion = (question: LongAnswerQuestion) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold leading-relaxed">
          {question.question}
        </h3>
        
        {question.keyPoints && question.keyPoints.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">Consider these points in your answer:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {question.keyPoints.map((point, index) => (
                <li key={index} className="text-sm">{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`answer-${currentQuestionIndex}`} className="text-base">
          Your Answer:
        </Label>
        <Textarea
          id={`answer-${currentQuestionIndex}`}
          placeholder="Provide a detailed answer..."
          value={(currentAnswer?.answer as string) || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
          className="min-h-[200px] text-base"
        />
      </div>
    </div>
  );

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'mcq':
        return renderMCQQuestion(currentQuestion);
      case 'objective':
        return renderObjectiveQuestion(currentQuestion);
      case 'long':
        return renderLongAnswerQuestion(currentQuestion);
      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress and Timer Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AceternityCard className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </AceternityCard>
        
        {timeRemaining !== undefined && (
          <AceternityCard className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">Time Remaining</div>
                <div className={`font-mono text-lg ${
                  timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </AceternityCard>
        )}
        
        <AceternityCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Question Type</div>
              <Badge className={questionTypeColors[currentQuestion.type]}>
                {questionTypeLabels[currentQuestion.type]}
              </Badge>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
              {(() => {
                const Icon = questionTypeIcons[currentQuestion.type];
                return <Icon className="h-4 w-4 text-slate-600" />;
              })()}
            </div>
          </div>
        </AceternityCard>
      </div>

      {/* Main Question Card */}
      <AceternityCard>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex items-start justify-between">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1}
              </div>
              <Badge variant="outline" className="text-xs">
                {currentAnswer?.answer !== undefined ? 'Answered' : 'Not answered'}
              </Badge>
            </div>

            {renderQuestion()}
          </motion.div>
        </AnimatePresence>
      </AceternityCard>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestionIndex
                  ? 'bg-slate-500'
                  : answers[index]?.answer !== undefined
                  ? 'bg-emerald-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {isLastQuestion ? (
          <Button
            onClick={onSubmit}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            disabled={Object.keys(answers).length === 0}
          >
            <Send className="h-4 w-4" />
            <span>Submit Quiz</span>
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
