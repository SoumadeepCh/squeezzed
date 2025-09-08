import mongoose, { Schema, Document } from 'mongoose';

interface QuestionResult {
  questionIndex: number;
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctAnswer?: string;
}

interface QuestionDetail {
  type: 'mcq' | 'objective' | 'long';
  question: string;
  userAnswer?: string | number;
  timeSpent: number;
  result?: QuestionResult;
  options?: string[];
  correctAnswer?: string | number;
  keyPoints?: string[];
}

interface QuizSummary {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  percentage: number;
}

interface QuizMetadata {
  topic: string;
  difficulty: string;
  totalQuestions: number;
  questionsAnswered: number;
  totalTimeSpent: number;
  timeLimit: number | null;
  completedAt: string;
}

export interface IQuiz extends Document {
  userId: mongoose.Types.ObjectId;
  results: QuestionResult[];
  summary: QuizSummary;
  quizMetadata: QuizMetadata;
  questionDetails: QuestionDetail[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionResultSchema = new Schema({
  questionIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true },
  correctAnswer: { type: String },
});

const QuestionDetailSchema = new Schema({
  type: { 
    type: String, 
    enum: ['mcq', 'objective', 'long'], 
    required: true 
  },
  question: { type: String, required: true },
  userAnswer: { type: Schema.Types.Mixed },
  timeSpent: { type: Number, required: true },
  result: QuestionResultSchema,
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed },
  keyPoints: [{ type: String }],
});

const QuizSummarySchema = new Schema({
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  averageScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
});

const QuizMetadataSchema = new Schema({
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  questionsAnswered: { type: Number, required: true },
  totalTimeSpent: { type: Number, required: true },
  timeLimit: { type: Number },
  completedAt: { type: String, required: true },
});

const QuizSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  results: [QuestionResultSchema],
  summary: { type: QuizSummarySchema, required: true },
  quizMetadata: { type: QuizMetadataSchema, required: true },
  questionDetails: [QuestionDetailSchema],
}, {
  timestamps: true,
});

// Indexes for faster queries
QuizSchema.index({ userId: 1, createdAt: -1 });
QuizSchema.index({ 'quizMetadata.topic': 1 });
QuizSchema.index({ 'quizMetadata.difficulty': 1 });

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
