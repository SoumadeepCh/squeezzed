"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AceternityCard } from "@/components/ui/aceternity-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AuthModal from "@/components/auth/auth-modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RotateCcw,
  Share2,
  Download,
  Award,
  Brain,
  BookOpen,
  Save,
  Check,
} from "lucide-react";

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

interface QuizResultsProps {
  results: QuizResult;
  onRetakeQuiz: () => void;
  onNewQuiz: () => void;
}

const COLORS = ['#64748B', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function QuizResults({
  results,
  onRetakeQuiz,
  onNewQuiz,
}: QuizResultsProps) {
  const { summary, quizMetadata, questionDetails } = results;
  const { data: session } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 70) return "text-slate-600 bg-slate-100";
    if (percentage >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🥇";
    if (percentage >= 70) return "🥈";
    if (percentage >= 60) return "🥉";
    return "📝";
  };

  const handleSaveQuiz = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/quizzes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });

      if (response.ok) {
        setIsSaved(true);
        toast.success('Quiz saved successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save quiz');
      }
    } catch (error) {
      toast.error('An error occurred while saving the quiz');
    } finally {
      setIsSaving(false);
    }
  };

  // Prepare chart data
  const questionTypeData = questionDetails.reduce((acc, question) => {
    const type = question.type;
    const existing = acc.find(item => item.type === type);
    if (existing) {
      existing.total += 1;
      existing.correct += question.result?.isCorrect ? 1 : 0;
      existing.score += question.result?.score || 0;
    } else {
      acc.push({
        type: type.toUpperCase(),
        total: 1,
        correct: question.result?.isCorrect ? 1 : 0,
        score: question.result?.score || 0,
        accuracy: question.result?.isCorrect ? 100 : 0,
      });
    }
    return acc;
  }, [] as any[]);

  // Calculate accuracy for each type
  questionTypeData.forEach(item => {
    item.accuracy = Math.round((item.correct / item.total) * 100);
    item.avgScore = Math.round(item.score / item.total);
  });

  const timeDistributionData = questionDetails.map((question, index) => ({
    question: `Q${index + 1}`,
    timeSpent: question.timeSpent,
    score: question.result?.score || 0,
  }));

  const difficultyData = [
    {
      name: 'Correct',
      value: summary.correctAnswers,
      color: '#10B981',
    },
    {
      name: 'Incorrect',
      value: summary.totalQuestions - summary.correctAnswers,
      color: '#EF4444',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with main results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="text-6xl">{getScoreEmoji(summary.percentage)}</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
          Quiz Complete!
        </h1>
        <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${getScoreColor(summary.percentage)}`}>
          {summary.percentage}% Score
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AceternityCard>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-full">
              <Trophy className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.correctAnswers}/{summary.totalQuestions}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
          </div>
        </AceternityCard>

        <AceternityCard>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.averageScore}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </AceternityCard>

        <AceternityCard>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatTime(quizMetadata.totalTimeSpent)}</div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </AceternityCard>

        <AceternityCard>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold capitalize">{quizMetadata.difficulty}</div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
          </div>
        </AceternityCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Question Type */}
        <AceternityCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-slate-600" />
              <span>Performance by Question Type</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#64748B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AceternityCard>

        {/* Correct vs Incorrect */}
        <AceternityCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Answer Distribution</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AceternityCard>

        {/* Time Distribution */}
        <AceternityCard className="lg:col-span-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Time Spent per Question</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatTime(value), 'Time Spent']}
                  labelFormatter={(label: string) => `Question: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="timeSpent"
                  stroke="#F59E0B"
                  fill="#FDE68A"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AceternityCard>
      </div>

      {/* Detailed Results */}
      <AceternityCard>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-slate-600" />
            <span>Detailed Question Analysis</span>
          </h3>
          
          <div className="space-y-4">
            {questionDetails.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <Badge className={
                        question.type === 'mcq' ? 'bg-slate-100 text-slate-700' :
                        question.type === 'objective' ? 'bg-gray-100 text-gray-700' :
                        'bg-stone-100 text-stone-700'
                      }>
                        {question.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatTime(question.timeSpent)}
                      </span>
                    </div>
                    <p className="font-medium mb-2">{question.question}</p>
                    {question.userAnswer && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Your answer:</span> {question.userAnswer}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {question.result?.isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    <div className="text-right">
                      <div className="font-bold">
                        {question.result?.score || 0}/100
                      </div>
                    </div>
                  </div>
                </div>
                {question.result?.feedback && (
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <span className="font-medium">Feedback:</span> {question.result.feedback}
                  </div>
                )}
                <Progress 
                  value={question.result?.score || 0} 
                  className="h-2"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </AceternityCard>

      {/* Quiz Metadata */}
      <AceternityCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quiz Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Topic:</span> {quizMetadata.topic}
            </div>
            <div>
              <span className="font-medium">Difficulty:</span> {quizMetadata.difficulty}
            </div>
            <div>
              <span className="font-medium">Questions Answered:</span> {quizMetadata.questionsAnswered} of {quizMetadata.totalQuestions}
            </div>
            <div>
              <span className="font-medium">Completed:</span> {new Date(quizMetadata.completedAt).toLocaleString()}
            </div>
            {quizMetadata.timeLimit && (
              <div>
                <span className="font-medium">Time Limit:</span> {formatTime(quizMetadata.timeLimit)}
              </div>
            )}
            <div>
              <span className="font-medium">Total Time:</span> {formatTime(quizMetadata.totalTimeSpent)}
            </div>
          </div>
        </div>
      </AceternityCard>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Save Quiz Button */}
        {!isSaved && (
          <Button
            onClick={handleSaveQuiz}
            className="flex items-center space-x-2 px-6 py-3"
            variant="outline"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{session ? (isSaving ? "Saving..." : "Save Quiz") : "Sign in to Save"}</span>
          </Button>
        )}
        
        {isSaved && (
          <Button
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700"
            disabled
          >
            <Check className="h-5 w-5" />
            <span>Quiz Saved</span>
          </Button>
        )}
        
        <Button
          onClick={onRetakeQuiz}
          className="flex items-center space-x-2 px-6 py-3"
          variant="outline"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Retake Quiz</span>
        </Button>
        
        <Button
          onClick={onNewQuiz}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
        >
          <Award className="h-5 w-5" />
          <span>New Quiz</span>
        </Button>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleSaveQuiz();
        }}
      />
    </div>
  );
}
