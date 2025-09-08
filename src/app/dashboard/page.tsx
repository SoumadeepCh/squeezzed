"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { AceternityCard } from "@/components/ui/aceternity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Target,
  Trophy,
  Search,
  Filter,
  Trash2,
  Eye,
  TrendingUp,
  BookOpen,
  Award,
} from "lucide-react";

interface SavedQuiz {
  _id: string;
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    averageScore: number;
  };
  quizMetadata: {
    topic: string;
    difficulty: string;
    totalTimeSpent: number;
    completedAt: string;
  };
  createdAt: string;
}

interface DashboardStats {
  totalQuizzes: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  topTopics: Array<{ topic: string; count: number }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    fetchQuizzes();
  }, [session, status, router, currentPage, selectedDifficulty]);

  const fetchQuizzes = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchTerm) params.append("topic", searchTerm);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);

      const response = await fetch(`/api/quizzes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes);
        setStats(data.statistics);
      } else {
        toast.error("Failed to fetch quizzes");
      }
    } catch (error) {
      toast.error("An error occurred while fetching quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuizzes();
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Quiz deleted successfully");
        fetchQuizzes();
      } else {
        toast.error("Failed to delete quiz");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the quiz");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-400 border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session.user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-gray-600">Track your quiz progress and achievements</p>
            </div>
            <Button
              onClick={() => router.push("/")}
              className="flex items-center space-x-2"
            >
              <Award className="h-4 w-4" />
              <span>Take New Quiz</span>
            </Button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AceternityCard>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                  <div className="text-sm text-gray-600">Quizzes Completed</div>
                </div>
              </div>
            </AceternityCard>

            <AceternityCard>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </AceternityCard>

            <AceternityCard>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalQuestionsAnswered}</div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
              </div>
            </AceternityCard>

            <AceternityCard>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.topTopics[0]?.topic || "None"}
                  </div>
                  <div className="text-sm text-gray-600">Favorite Topic</div>
                </div>
              </div>
            </AceternityCard>
          </div>
        )}

        {/* Search and Filters */}
        <AceternityCard>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <Button onClick={handleSearch} size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AceternityCard>

        {/* Quizzes List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your quizzes...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <AceternityCard>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedDifficulty
                    ? "Try adjusting your search filters"
                    : "Start taking quizzes to see your progress here"}
                </p>
                <Button onClick={() => router.push("/")}>
                  Take Your First Quiz
                </Button>
              </div>
            </AceternityCard>
          ) : (
            quizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AceternityCard>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {quiz.quizMetadata.topic}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(quiz.quizMetadata.completedAt)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(quiz.quizMetadata.totalTimeSpent)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {quiz.quizMetadata.difficulty}
                          </Badge>
                          <Badge className={getScoreColor(quiz.summary.percentage)}>
                            {quiz.summary.percentage}%
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            Score: {quiz.summary.correctAnswers}/{quiz.summary.totalQuestions}
                          </span>
                          <span>{quiz.summary.percentage}%</span>
                        </div>
                        <Progress value={quiz.summary.percentage} className="h-2" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/quiz/${quiz._id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AceternityCard>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
