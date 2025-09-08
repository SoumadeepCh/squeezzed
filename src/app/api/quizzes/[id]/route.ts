import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongoose';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view quiz details.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find quiz and ensure it belongs to the current user
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const quiz = await Quiz.findOne({
      _id: id,
      userId: userId
    }).lean();

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quiz });

  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete quizzes.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and delete quiz, ensuring it belongs to the current user
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const deletedQuiz = await Quiz.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!deletedQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Quiz deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
