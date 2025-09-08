"use client";

import { useState } from "react";
import { AceternityCard } from "@/components/ui/aceternity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Target,
  Shuffle,
  CheckCircle2,
  FileText,
  MessageSquare,
} from "lucide-react";

interface QuizConfig {
  topic: string;
  questionCount: number;
  questionTypes: string[];
  difficulty: string;
  timeLimit?: number;
}

interface QuizConfigProps {
  onStartQuiz: (config: QuizConfig) => void;
  loading?: boolean;
}

const questionTypeOptions = [
  {
    id: "mcq",
    label: "Multiple Choice",
    description: "Choose from 4 options",
    icon: CheckCircle2,
    color: "bg-slate-100 text-slate-700",
  },
  {
    id: "objective",
    label: "Short Answer",
    description: "Brief objective responses",
    icon: FileText,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "long",
    label: "Long Answer",
    description: "Detailed explanations",
    icon: MessageSquare,
    color: "bg-purple-100 text-purple-800",
  },
];

const difficultyLevels = [
  { value: "easy", label: "Easy", description: "Basic concepts" },
  { value: "medium", label: "Medium", description: "Intermediate level" },
  { value: "hard", label: "Hard", description: "Advanced topics" },
];

const popularTopics = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "Data Structures",
  "Machine Learning",
  "Database Design",
  "System Design",
];

export default function QuizConfig({ onStartQuiz, loading = false }: QuizConfigProps) {
  const [config, setConfig] = useState<QuizConfig>({
    topic: "",
    questionCount: 10,
    questionTypes: ["mcq"],
    difficulty: "medium",
    timeLimit: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.topic.trim() && config.questionTypes.length > 0) {
      onStartQuiz(config);
    }
  };

  const toggleQuestionType = (type: string) => {
    setConfig((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter((t) => t !== type)
        : [...prev.questionTypes, type],
    }));
  };

  const selectTopic = (topic: string) => {
    setConfig((prev) => ({ ...prev, topic }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent mb-4">
          Create Your Quiz
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Customize your learning experience with AI-generated questions tailored to your needs.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topic Selection */}
          <AceternityCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-slate-600" />
                <Label htmlFor="topic" className="text-lg font-semibold">
                  Quiz Topic
                </Label>
              </div>
              <Input
                id="topic"
                placeholder="Enter your topic (e.g., JavaScript, Python, React)"
                value={config.topic}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, topic: e.target.value }))
                }
                className="text-base"
              />
              
              {/* Popular Topics */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Popular topics:</p>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => selectTopic(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </AceternityCard>

          {/* Quiz Settings */}
          <AceternityCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-slate-600" />
                <Label className="text-lg font-semibold">Quiz Settings</Label>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="count">Number of Questions (1-100)</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="100"
                    value={config.questionCount}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        questionCount: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                
                <div>
                  <Label>Difficulty Level</Label>
                  <Select
                    value={config.difficulty}
                    onValueChange={(value) =>
                      setConfig((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-gray-500">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    placeholder="No time limit"
                    value={config.timeLimit || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </AceternityCard>
        </div>

        {/* Question Types */}
        <AceternityCard>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shuffle className="h-5 w-5 text-slate-600" />
              <Label className="text-lg font-semibold">Question Types</Label>
            </div>
            <p className="text-sm text-gray-600">Select one or more question types for your quiz.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {questionTypeOptions.map((option) => {
                const isSelected = config.questionTypes.includes(option.id);
                return (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-slate-400 bg-slate-50/50"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => toggleQuestionType(option.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <option.icon className="h-5 w-5 text-slate-600" />
                            <CardTitle className="text-base">{option.label}</CardTitle>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </AceternityCard>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={!config.topic.trim() || config.questionTypes.length === 0 || loading}
            className="px-8 py-3 text-lg bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Generating Quiz...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Start Quiz</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
