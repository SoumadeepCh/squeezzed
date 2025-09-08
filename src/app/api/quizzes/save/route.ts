import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongoose';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Save quiz session:', {
      user: session?.user,
      userId: session?.user?.id,
      userIdType: typeof session?.user?.id
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to save quizzes.' },
        { status: 401 }
      );
    }

    const quizData = await request.json();

    // Validation
    if (!quizData.results || !quizData.summary || !quizData.quizMetadata || !quizData.questionDetails) {
      return NextResponse.json(
        { error: 'Invalid quiz data format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create quiz document  
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const quiz = new Quiz({
      userId: userId,
      results: quizData.results,
      summary: quizData.summary,
      quizMetadata: quizData.quizMetadata,
      questionDetails: quizData.questionDetails,
    });

    console.log('Saving quiz with userId:', session.user.id);
    await quiz.save();
    console.log('Quiz saved successfully:', quiz._id);

    return NextResponse.json(
      { 
        message: 'Quiz saved successfully', 
        quizId: quiz._id,
        createdAt: quiz.createdAt 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Save quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz' },
      { status: 500 }
    );
  }
}
