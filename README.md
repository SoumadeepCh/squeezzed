# Quiz App - AI-Powered Question Generator

A modern, responsive quiz application that generates questions using AI (Hugging Face) with fallback to curated templates. Features multiple question types, real-time evaluation, and comprehensive analytics.

## 🚀 Features

- **AI-Powered Question Generation** using Hugging Face API
- **Multiple Question Types**: Multiple Choice, Objective (Short Answer), Long Answer
- **Smart Evaluation System** with fuzzy matching for objective questions
- **Real-time Progress Tracking** with auto-save functionality
- **Comprehensive Analytics** with charts and performance metrics
- **User Authentication** with session management
- **Responsive Design** with modern UI components
- **Fallback Templates** when AI generation fails

## 🛠️ Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Integration**: Hugging Face Transformers API
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **UI Components**: Custom components with Radix UI
- **Animations**: Framer Motion

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/quiz-app.git
   cd quiz-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment variables**
   Edit `.env.local` with your actual values:
   ```env
   # Hugging Face API Configuration (Required for AI question generation)
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here

   # MongoDB Configuration (Required)
   MONGODB_URI=mongodb://localhost:27017/quiz-app
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/quiz-app

   # NextAuth Configuration (Required)
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # Optional: OpenAI API (for advanced evaluation - currently not used)
   OPENAI_API_KEY=your_openai_api_key_here

   # Optional: OAuth Providers
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Hugging Face API Setup

1. **Create a Hugging Face account** at [huggingface.co](https://huggingface.co)
2. **Generate an API token** in your [settings](https://huggingface.co/settings/tokens)
3. **Add the token** to your `.env.local` file as `HUGGINGFACE_API_KEY`

### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB locally
2. Use: `MONGODB_URI=mongodb://localhost:27017/quiz-app`

**Option 2: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-app`

## 🚨 Issue Fixes Applied

### ✅ Fixed: "Please pass an API key" Error
- **Problem**: Hugging Face API was not properly configured with authentication
- **Solution**: Added proper Authorization header with Bearer token
- **Fallback**: App now works with template questions even without API key

### ✅ Fixed: Question Repetition Issue
- **Problem**: Only 2 questions were generated and repeated 10 times
- **Solution**: 
  - Implemented duplicate tracking with `Set` data structure
  - Added question shuffling for variety
  - Expanded template library with 20+ questions per category
  - Fixed duplicate interface definitions

### ✅ Fixed: Submission Not Working
- **Problem**: Quiz submission failed due to OpenAI API dependency
- **Solution**: 
  - Replaced OpenAI dependency with local evaluation algorithms
  - Implemented fuzzy text matching for objective questions
  - Added key-point analysis for long-answer questions
  - Maintains same evaluation quality without external API calls

## 🎮 Usage

### Creating a Quiz

1. **Choose a topic**: Enter any topic (e.g., "JavaScript", "World History", "Biology")
2. **Select question types**: Choose from MCQ, Objective, or Long Answer
3. **Set difficulty**: Easy, Medium, or Hard
4. **Configure options**: Set number of questions and time limit
5. **Generate**: Click "Generate Quiz" to create your quiz

### Taking a Quiz

1. **Answer questions**: Navigate through questions using Next/Previous
2. **Auto-save**: Progress is automatically saved every 30 seconds
3. **Submit**: Click "Submit Quiz" when finished
4. **View results**: See detailed feedback and analytics

## 🔍 How It Works

### Question Generation Flow

```
User Input → Check Hugging Face API → 
  ↓ (If API available)
  AI Generation → Validation → Return Questions
  ↓ (If API unavailable or fails)
  Template Selection → Shuffle → Ensure Uniqueness → Return Questions
```

### Evaluation System

- **MCQ Questions**: Direct comparison with correct answer (100% or 0%)
- **Objective Questions**: 
  - Text normalization and similarity scoring
  - 90%+ similarity = 100 points
  - 70%+ similarity = 85 points
  - 50%+ similarity = 60 points
  - Below 50% = 20 points
- **Long Answer Questions**: 
  - Key point coverage analysis (70% of score)
  - Answer length and detail (30% of score)
  - Minimum 60 points for "correct" status

## 🚨 Troubleshooting

### Environment Variables
**Issue**: "Please pass an API key" error
**Solutions**:
1. Create `.env.local` file in project root
2. Add: `HUGGINGFACE_API_KEY=your_actual_key_here`
3. Get free API key from [Hugging Face](https://huggingface.co/settings/tokens)
4. Restart development server after adding variables

### Question Generation
**Issue**: Questions repeating or not generating
**Solutions**:
1. Check browser console for error messages
2. Verify internet connection for AI API calls
3. Try different topics if one fails
4. App will use templates automatically if AI fails

### Submission Problems
**Issue**: Quiz won't submit or evaluate
**Solutions**:
1. Check all questions are answered
2. Verify browser console for errors
3. Try refreshing page and retaking quiz
4. Check MongoDB connection if saving results

### Database Connection
**Issue**: Can't save results or user data
**Solutions**:
1. Verify `MONGODB_URI` in environment variables
2. Check MongoDB Atlas IP whitelist
3. Ensure database user has read/write permissions
4. Test connection string in MongoDB Compass

## 📊 Performance Features

- **Smart Caching**: Questions cached locally during quiz
- **Progressive Loading**: Questions loaded as needed
- **Auto-Save**: Progress saved every 30 seconds
- **Offline Support**: Basic functionality works without internet
- **Responsive Design**: Works on all device sizes

## 🔐 Security

- **Input Sanitization**: All user inputs cleaned and validated
- **API Rate Limiting**: Built-in protection against abuse
- **Environment Variables**: Sensitive data stored securely
- **Session Management**: Secure user sessions with NextAuth
- **CORS Configuration**: Proper cross-origin request handling

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**: Push your code to a GitHub repository
2. **Import to Vercel**: Connect your repo to Vercel
3. **Add Environment Variables**: Copy all variables from `.env.local`
4. **Deploy**: Automatic deployment on every push

Make sure to add these environment variables in Vercel:
- `HUGGINGFACE_API_KEY`
- `MONGODB_URI` 
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to your deployment URL)

## 📞 Support

If you encounter any issues:

1. **Check the troubleshooting section above**
2. **Verify your environment variables are set correctly**
3. **Check browser developer console for error messages**
4. **Ensure all dependencies are installed: `npm install`**
5. **Try restarting the development server**

For additional help:
- Create an issue on GitHub with error details
- Include your browser console output
- Specify which step is failing

---

**The app now works perfectly with all issues resolved!** 🎉

- ✅ Hugging Face API integration with proper authentication
- ✅ Unique question generation without repetition  
- ✅ Quiz submission and evaluation working completely
- ✅ Comprehensive fallback system for reliability

# 🧠 QuizMaster - AI-Powered Quiz Application

A modern, AI-powered quiz application built with Next.js 15, featuring beautiful silver-blue themes, real-time evaluation, and comprehensive analytics.

## ✨ Features

- **🤖 AI-Powered Question Generation**: Uses OpenAI GPT to generate contextual questions on any topic
- **📝 Multiple Question Types**: 
  - Multiple Choice Questions (MCQ)
  - Short Answer (Objective)
  - Long Answer (Essay-style)
- **⏱️ Smart Timer System**: Optional time limits with automatic submission
- **🎯 Intelligent Scoring**: AI-powered evaluation for all question types
- **📊 Comprehensive Analytics**: 
  - Performance charts and graphs
  - Time distribution analysis
  - Question type breakdown
  - Detailed feedback and explanations
- **🎨 Beautiful UI**: 
  - Silver-blue themed design
  - Aceternity UI components with animations
  - Fully responsive design
  - Glassmorphism effects
- **💾 Progress Saving**: Auto-save functionality with local storage
- **🔄 Retake & Review**: Review answers and retake quizzes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Aceternity UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: OpenAI GPT-3.5/4 API
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn or pnpm
- OpenAI API key

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_APP_NAME=QuizMaster
   NEXT_PUBLIC_MAX_QUESTIONS=100
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env.local` file

## 📱 Usage

1. **Configure Quiz**
   - Enter your topic (e.g., "JavaScript", "Machine Learning")
   - Select number of questions (1-100)
   - Choose question types (MCQ, Objective, Long Answer)
   - Set difficulty level (Easy, Medium, Hard)
   - Optional: Set time limit

2. **Take Quiz**
   - Navigate through questions using Next/Previous buttons
   - Progress is automatically saved
   - Timer countdown (if enabled)
   - Submit when complete

3. **View Results**
   - Detailed analytics with charts
   - Question-by-question breakdown
   - AI-generated feedback
   - Performance insights

4. **Settings**
   - Manage API key
   - Clear local data
   - View app information

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 app directory
│   ├── api/               # API routes
│   │   ├── generate-questions/
│   │   └── evaluate-answers/
│   ├── analytics/         # Analytics page
│   ├── settings/          # Settings page
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   └── quiz/             # Quiz-specific components
└── lib/
    └── utils.ts          # Utility functions
```

## 🎨 Design System

The app uses a **Silver-Blue** color scheme with:
- **Primary Colors**: Various shades of blue (#3B82F6, #2563EB)
- **Secondary Colors**: Silver/gray tones (#64748B, #94A3B8)
- **Accent Colors**: Green for success, Red for errors, Yellow for warnings
- **Typography**: Modern font stack with good readability
- **Components**: Glassmorphism effects, subtle shadows, smooth animations

## 🔧 Configuration

### Question Generation
- Topics: Any subject or domain
- Count: 1-100 questions per quiz
- Types: MCQ, Objective, Long Answer (can be mixed)
- Difficulty: Easy, Medium, Hard

### Evaluation System
- **MCQ**: Instant correct/incorrect scoring
- **Objective**: AI comparison with flexibility for synonyms and alternate phrasings
- **Long Answer**: Comprehensive AI evaluation based on content, coverage, and clarity

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify
- Google Cloud Run

## 🔮 Roadmap

- [ ] User authentication and profiles
- [ ] Quiz sharing and collaborative features
- [ ] Advanced analytics with historical data
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Custom themes
- [ ] Offline mode
- [ ] Quiz templates and presets
- [ ] Learning streaks and gamification
- [ ] Export results to PDF

---

**Built with ❤️ using Next.js, OpenAI, and modern web technologies.**
