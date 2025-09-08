import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongoose';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Fetch quizzes session:', {
      user: session?.user,
      userId: session?.user?.id,
      userIdType: typeof session?.user?.id
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view saved quizzes.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');

    await connectDB();

    // Build query
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const query: Record<string, unknown> = { userId: userId };
    
    if (topic) {
      query['quizMetadata.topic'] = { $regex: topic, $options: 'i' };
    }
    
    if (difficulty) {
      query['quizMetadata.difficulty'] = difficulty;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get quizzes with pagination
    console.log('Query for user quizzes:', query);
    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-questionDetails') // Exclude detailed questions for list view
      .lean();

    console.log('Found quizzes:', quizzes.length);
    if (quizzes.length > 0) {
      console.log('Sample quiz userId:', quizzes[0].userId, 'type:', typeof quizzes[0].userId);
    }

    // Get total count for pagination
    const totalQuizzes = await Quiz.countDocuments(query);
    console.log('Total quiz count:', totalQuizzes);
    const totalPages = Math.ceil(totalQuizzes / limit);

    // Calculate statistics
    const stats = await Quiz.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          averageScore: { $avg: '$summary.percentage' },
          totalQuestionsAnswered: { $sum: '$summary.totalQuestions' },
          favoriteTopics: { $push: '$quizMetadata.topic' },
        }
      }
    ]);

    // Process favorite topics
    let topTopics: { topic: string; count: number }[] = [];
    if (stats.length > 0 && stats[0].favoriteTopics) {
      const topicCounts = stats[0].favoriteTopics.reduce((acc: Record<string, number>, topic: string) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {});
      
      topTopics = Object.entries(topicCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count: count as number }));
    }

    return NextResponse.json({
      quizzes,
      pagination: {
        currentPage: page,
        totalPages,
        totalQuizzes,
        limit,
      },
      statistics: {
        totalQuizzes: stats.length > 0 ? stats[0].totalQuizzes : 0,
        averageScore: stats.length > 0 ? Math.round(stats[0].averageScore || 0) : 0,
        totalQuestionsAnswered: stats.length > 0 ? stats[0].totalQuestionsAnswered : 0,
        topTopics,
      }
    });

  } catch (error) {
    console.error('Get quizzes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}
