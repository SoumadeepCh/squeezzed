"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AceternityCard } from "@/components/ui/aceternity-card";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Trophy,
  Award,
} from "lucide-react";

interface AnalyticsData {
  totalQuizzes: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  topTopics: Array<{ topic: string; count: number }>;
  recentQuizzes: Array<{
    _id: string;
    summary: { percentage: number };
    quizMetadata: { topic: string; completedAt: string };
  }>;
}

const COLORS = ['#64748B', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    fetchAnalytics();
  }, [session, status, router]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/quizzes?limit=100');
      if (response.ok) {
        const result = await response.json();
        setData({
          ...result.statistics,
          recentQuizzes: result.quizzes.slice(0, 10)
        });
      } else {
        toast.error("Failed to fetch analytics data");
      }
    } catch (error) {
      toast.error("An error occurred while fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!data?.recentQuizzes) return [];
    
    return data.recentQuizzes.map((quiz, index) => ({
      quiz: `Quiz ${data.recentQuizzes.length - index}`,
      score: quiz.summary.percentage,
      topic: quiz.quizMetadata.topic,
    })).reverse();
  };

  const prepareTopicData = () => {
    if (!data?.topTopics) return [];
    
    return data.topTopics.slice(0, 5).map(topic => ({
      name: topic.topic,
      value: topic.count,
    }));
  };

  if (status === "loading" || loading) {
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

  if (!data || data.totalQuizzes === 0) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Analytics Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your learning progress and analyze your quiz performance over time.
            </p>
          </motion.div>

          <div className="grid place-items-center min-h-[400px]">
            <AceternityCard className="max-w-lg text-center">
              <div className="space-y-6">
                <div className="text-6xl">📊</div>
                <h2 className="text-2xl font-semibold">No Data Yet!</h2>
                <p className="text-gray-600">
                  Take some quizzes to see your analytics and progress.
                </p>
                <Button onClick={() => router.push("/")}>
                  Take Your First Quiz
                </Button>
              </div>
            </AceternityCard>
          </div>
        </div>
      </MainLayout>
    );
  }

  const chartData = prepareChartData();
  const topicData = prepareTopicData();

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
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">Track your quiz performance and learning progress</p>
            </div>
            <Button onClick={() => router.push("/")}>
              <Award className="h-4 w-4 mr-2" />
              Take New Quiz
            </Button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AceternityCard>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-100 rounded-full">
                <BookOpen className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.totalQuizzes}</div>
                <div className="text-sm text-gray-600">Total Quizzes</div>
              </div>
            </div>
          </AceternityCard>

          <AceternityCard>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.averageScore}%</div>
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
                <div className="text-2xl font-bold">{data.totalQuestionsAnswered}</div>
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
                  {data.topTopics[0]?.topic || "None"}
                </div>
                <div className="text-sm text-gray-600">Top Topic</div>
              </div>
            </div>
          </AceternityCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <AceternityCard>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                <span>Recent Performance</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quiz" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#64748B" 
                    strokeWidth={2}
                    dot={{ fill: '#64748B' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AceternityCard>

          {/* Topic Distribution */}
          <AceternityCard>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Topic Distribution</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topicData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AceternityCard>
        </div>

        {/* Topic Performance */}
        {data.topTopics.length > 0 && (
          <AceternityCard>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <span>Quiz Count by Topic</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topTopics.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#64748B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AceternityCard>
        )}
      </div>
    </MainLayout>
  );
}
