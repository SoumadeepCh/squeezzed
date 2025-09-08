import { NextRequest, NextResponse } from 'next/server';

// Interface definitions
interface QuestionRequest {
  topic: string;
  questionCount: number;
  questionTypes: string[];
  difficulty: string;
}

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

// Expanded question templates for different subjects and types
const QUESTION_TEMPLATES = {
  mcq: {
    programming: [
      {
        question: "What does the 'const' keyword do in JavaScript?",
        options: ["Declares a constant variable", "Creates a function", "Defines a class", "Imports a module"],
        correctAnswer: 0,
        explanation: "The 'const' keyword declares a block-scoped constant variable that cannot be reassigned."
      },
      {
        question: "Which method is used to add an element to the end of an array in JavaScript?",
        options: ["append()", "push()", "add()", "insert()"],
        correctAnswer: 1,
        explanation: "The push() method adds one or more elements to the end of an array and returns the new length."
      },
      {
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: ["No difference", "=== checks type and value, == only checks value", "== is faster than ===", "=== is deprecated"],
        correctAnswer: 1,
        explanation: "=== performs strict equality comparison (type and value), while == performs loose equality with type coercion."
      },
      {
        question: "Which of the following is NOT a primitive data type in JavaScript?",
        options: ["string", "boolean", "object", "number"],
        correctAnswer: 2,
        explanation: "Object is not a primitive data type. The primitive types are: string, number, boolean, undefined, null, symbol, and bigint."
      },
      {
        question: "What does the 'this' keyword refer to in JavaScript?",
        options: ["The current function", "The global object", "The object that calls the method", "The parent element"],
        correctAnswer: 2,
        explanation: "'this' refers to the object that is executing the current function or method."
      },
      {
        question: "Which HTTP method is used to retrieve data?",
        options: ["POST", "PUT", "GET", "DELETE"],
        correctAnswer: 2,
        explanation: "GET is the HTTP method used to retrieve data from a server."
      },
      {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        correctAnswer: 1,
        explanation: "CSS stands for Cascading Style Sheets, used for styling web pages."
      },
      {
        question: "Which data structure follows LIFO (Last In, First Out)?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: 1,
        explanation: "A Stack follows LIFO principle where the last element added is the first one to be removed."
      },
      {
        question: "What is Big O notation used for?",
        options: ["Measuring code quality", "Algorithm complexity analysis", "Variable naming", "Database optimization"],
        correctAnswer: 1,
        explanation: "Big O notation is used to analyze the time and space complexity of algorithms."
      }
    ],
    science: [
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctAnswer: 2,
        explanation: "Au comes from the Latin word 'aurum' meaning gold."
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        explanation: "Mars is called the Red Planet due to iron oxide (rust) on its surface."
      },
      {
        question: "What is the smallest unit of matter?",
        options: ["Molecule", "Atom", "Proton", "Electron"],
        correctAnswer: 1,
        explanation: "An atom is the smallest unit of matter that retains the properties of an element."
      },
      {
        question: "Which gas makes up approximately 78% of Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
        correctAnswer: 2,
        explanation: "Nitrogen makes up about 78% of Earth's atmosphere, while oxygen is about 21%."
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correctAnswer: 2,
        explanation: "Mitochondria are called the powerhouse of the cell because they produce ATP (energy) through cellular respiration."
      }
    ],
    history: [
      {
        question: "In which year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correctAnswer: 1,
        explanation: "World War II ended in 1945 with the surrender of Japan in September."
      },
      {
        question: "Who was the first President of the United States?",
        options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"],
        correctAnswer: 2,
        explanation: "George Washington served as the first President of the United States from 1789 to 1797."
      },
      {
        question: "The Berlin Wall fell in which year?",
        options: ["1987", "1988", "1989", "1990"],
        correctAnswer: 2,
        explanation: "The Berlin Wall fell on November 9, 1989, marking the beginning of German reunification."
      },
      {
        question: "Which empire was ruled by Julius Caesar?",
        options: ["Greek Empire", "Roman Empire", "Byzantine Empire", "Persian Empire"],
        correctAnswer: 1,
        explanation: "Julius Caesar was a Roman general and statesman who played a critical role in the Roman Republic."
      }
    ],
    mathematics: [
      {
        question: "What is the value of π (pi) rounded to two decimal places?",
        options: ["3.14", "3.41", "2.14", "3.15"],
        correctAnswer: 0,
        explanation: "Pi (π) is approximately 3.14159, which rounds to 3.14 when rounded to two decimal places."
      },
      {
        question: "What is the square root of 64?",
        options: ["6", "7", "8", "9"],
        correctAnswer: 2,
        explanation: "The square root of 64 is 8, because 8 × 8 = 64."
      },
      {
        question: "In a right triangle, what is the relationship between the sides?",
        options: ["a + b = c", "a² + b² = c²", "a × b = c", "a² + b = c²"],
        correctAnswer: 1,
        explanation: "The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse."
      },
      {
        question: "What is 15% of 200?",
        options: ["30", "25", "35", "20"],
        correctAnswer: 0,
        explanation: "15% of 200 = 0.15 × 200 = 30."
      },
      {
        question: "What is the derivative of x²?",
        options: ["x", "2x", "x²", "2x²"],
        correctAnswer: 1,
        explanation: "Using the power rule, the derivative of x² is 2x."
      },
      {
        question: "What is the area of a circle with radius 3?",
        options: ["6π", "9π", "3π", "12π"],
        correctAnswer: 1,
        explanation: "Area of a circle = πr², so with radius 3: π × 3² = 9π."
      },
      {
        question: "What is log₁₀(100)?",
        options: ["1", "2", "10", "100"],
        correctAnswer: 1,
        explanation: "log₁₀(100) = 2 because 10² = 100."
      }
    ]
  },
  objective: {
    programming: [
      {
        question: "What does HTML stand for?",
        correctAnswer: "HyperText Markup Language",
        explanation: "HTML is the standard markup language used to create web pages."
      },
      {
        question: "Name the programming language created by Guido van Rossum.",
        correctAnswer: "Python",
        explanation: "Python was created by Guido van Rossum and first released in 1991."
      },
      {
        question: "What does CSS stand for?",
        correctAnswer: "Cascading Style Sheets",
        explanation: "CSS is used to style and layout web pages."
      },
      {
        question: "What does API stand for?",
        correctAnswer: "Application Programming Interface",
        explanation: "An API is a set of protocols and tools for building software applications."
      },
      {
        question: "What does JSON stand for?",
        correctAnswer: "JavaScript Object Notation",
        explanation: "JSON is a lightweight data-interchange format that is easy for humans to read and write."
      }
    ],
    science: [
      {
        question: "What gas do plants absorb from the atmosphere during photosynthesis?",
        correctAnswer: "Carbon dioxide",
        explanation: "Plants absorb CO2 and convert it to glucose using sunlight and water."
      },
      {
        question: "What is the hardest natural substance on Earth?",
        correctAnswer: "Diamond",
        explanation: "Diamond is the hardest known natural material, rating 10 on the Mohs scale."
      },
      {
        question: "What is the chemical formula for water?",
        correctAnswer: "H2O",
        explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom."
      },
      {
        question: "What force keeps planets in orbit around the sun?",
        correctAnswer: "Gravity",
        explanation: "Gravitational force from the sun keeps planets in their orbital paths."
      },
      {
        question: "What is the speed of light in vacuum?",
        correctAnswer: "299,792,458 meters per second",
        explanation: "The speed of light in vacuum is exactly 299,792,458 meters per second."
      }
    ],
    history: [
      {
        question: "Who was the first person to walk on the moon?",
        correctAnswer: "Neil Armstrong",
        explanation: "Neil Armstrong was the first human to step onto the Moon on July 20, 1969."
      },
      {
        question: "In which city was President John F. Kennedy assassinated?",
        correctAnswer: "Dallas",
        explanation: "President Kennedy was assassinated in Dallas, Texas, on November 22, 1963."
      },
      {
        question: "What year did the Titanic sink?",
        correctAnswer: "1912",
        explanation: "The RMS Titanic sank on April 15, 1912, after hitting an iceberg."
      },
      {
        question: "Who painted the Mona Lisa?",
        correctAnswer: "Leonardo da Vinci",
        explanation: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519."
      }
    ],
    mathematics: [
      {
        question: "What is 2 + 2 × 3?",
        correctAnswer: "8",
        explanation: "Following order of operations (PEMDAS), multiplication comes before addition: 2 + (2 × 3) = 2 + 6 = 8."
      },
      {
        question: "What is the next prime number after 7?",
        correctAnswer: "11",
        explanation: "After 7, the next prime number is 11 (only divisible by 1 and itself)."
      },
      {
        question: "What is the area of a circle with radius 5?",
        correctAnswer: "25π or approximately 78.54",
        explanation: "Area of a circle = πr², so with radius 5: π × 5² = 25π ≈ 78.54 square units."
      }
    ]
  },
  long: {
    programming: [
      {
        question: "Explain the concept of Object-Oriented Programming and its main principles.",
        keyPoints: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
        sampleAnswer: "Object-Oriented Programming (OOP) is a programming paradigm based on objects and classes. The four main principles are: 1) Encapsulation - bundling data and methods together and hiding internal details, 2) Inheritance - creating new classes based on existing ones to reuse code, 3) Polymorphism - objects taking multiple forms and responding to the same interface differently, and 4) Abstraction - hiding complex implementation details and showing only essential features."
      },
      {
        question: "Describe the differences between SQL and NoSQL databases, and when you would use each.",
        keyPoints: ["Structure", "Scalability", "ACID properties", "Use cases"],
        sampleAnswer: "SQL databases are relational, structured with predefined schemas, and use SQL for queries. They ensure ACID properties and are ideal for complex transactions. NoSQL databases are non-relational, more flexible with dynamic schemas, and horizontally scalable. Use SQL for financial systems, analytics, and complex relationships. Use NoSQL for big data, real-time applications, and rapid development with changing requirements."
      }
    ],
    science: [
      {
        question: "Describe the process of photosynthesis and its importance to life on Earth.",
        keyPoints: ["Light absorption", "Carbon dioxide intake", "Glucose production", "Oxygen release"],
        sampleAnswer: "Photosynthesis is the process by which plants convert light energy into chemical energy. Plants absorb sunlight through chlorophyll in their leaves, take in CO2 through stomata, and combine these with water to produce glucose and oxygen. The chemical equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. This process is crucial as it provides food for plants (primary producers) and oxygen for most life forms on Earth, forming the foundation of most food chains."
      },
      {
        question: "Explain the theory of evolution by natural selection and provide examples.",
        keyPoints: ["Variation", "Inheritance", "Selection pressure", "Adaptation"],
        sampleAnswer: "Evolution by natural selection, proposed by Charles Darwin, explains how species change over time. It requires: 1) Variation within populations, 2) Heritable traits, 3) More offspring than can survive, and 4) Differential survival based on traits. Beneficial traits increase survival and reproduction chances. Examples include peppered moths during industrial revolution (dark moths survived better in polluted areas), antibiotic resistance in bacteria, and Darwin's finches with different beak shapes for different food sources."
      }
    ],
    history: [
      {
        question: "Analyze the causes and consequences of the Industrial Revolution.",
        keyPoints: ["Technological innovations", "Urbanization", "Social changes", "Economic transformation"],
        sampleAnswer: "The Industrial Revolution (1760-1840) was caused by technological innovations (steam engine, textile machinery), available capital from trade, abundant natural resources, and labor supply. It led to mass production, factory systems, and urbanization as people moved from farms to cities. Consequences included improved transportation (railways, canals), new social classes (industrial capitalists and workers), better living standards for some but also pollution, poor working conditions, and labor exploitation. It fundamentally transformed society from agricultural to industrial."
      },
      {
        question: "Discuss the factors that led to World War I and its global impact.",
        keyPoints: ["Imperialism", "Alliance system", "Nationalism", "Immediate trigger"],
        sampleAnswer: "World War I (1914-1918) resulted from multiple factors: imperialism created competition for colonies, the alliance system (Triple Alliance vs. Triple Entente) escalated conflicts, rising nationalism threatened empires, and the assassination of Archduke Franz Ferdinand was the immediate trigger. The war's impact was devastating: 16 million deaths, economic collapse, Russian Revolution, Ottoman Empire's fall, new nations created, and conditions set for World War II. It marked the end of European dominance and the beginning of American and Soviet power."
      }
    ]
  }
};

// Function to categorize topics
function categorizeTopic(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  // Programming and technology related keywords
  const programmingKeywords = [
    'programming', 'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'code', 'coding', 'html', 'css', 'react', 'angular', 'vue', 'node', 'nodejs',
    'software', 'web', 'api', 'database', 'sql', 'json', 'framework', 'library',
    'algorithm', 'data structure', 'oop', 'frontend', 'backend', 'fullstack'
  ];
  
  // Science related keywords
  const scienceKeywords = [
    'science', 'biology', 'chemistry', 'physics', 'plant', 'evolution', 'photosynthesis',
    'atom', 'molecule', 'element', 'compound', 'cell', 'dna', 'genetics', 'ecology',
    'thermodynamics', 'quantum', 'gravity', 'energy', 'matter', 'organism'
  ];
  
  // History related keywords
  const historyKeywords = [
    'history', 'historical', 'war', 'revolution', 'ancient', 'medieval', 'renaissance',
    'industrial', 'civilization', 'empire', 'dynasty', 'battle', 'treaty', 'colonial'
  ];
  
  // Mathematics related keywords
  const mathKeywords = [
    'math', 'mathematics', 'algebra', 'geometry', 'calculus', 'trigonometry',
    'statistics', 'probability', 'arithmetic', 'equation', 'formula', 'theorem'
  ];
  
  // Check each category
  if (programmingKeywords.some(keyword => topicLower.includes(keyword))) {
    return 'programming';
  }
  if (mathKeywords.some(keyword => topicLower.includes(keyword))) {
    return 'mathematics';
  }
  if (historyKeywords.some(keyword => topicLower.includes(keyword))) {
    return 'history';
  }
  if (scienceKeywords.some(keyword => topicLower.includes(keyword))) {
    return 'science';
  }
  
  // If no specific match, try to guess based on context or default to programming
  // Programming is chosen as default for tech-related quiz apps
  return 'programming';
}

// Shuffle array utility
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate unique questions using templates
function generateQuestionsFromTemplates(
  topic: string,
  questionCount: number,
  questionTypes: string[]
): Question[] {
  const category = categorizeTopic(topic);
  const questions: Question[] = [];
  const usedQuestions = new Set<string>();
  
  // Create a pool of all available questions from the category
  const allQuestions: Array<{ type: string; template: any }> = [];
  
  questionTypes.forEach(type => {
    const templates = QUESTION_TEMPLATES[type as keyof typeof QUESTION_TEMPLATES]?.[category as keyof typeof QUESTION_TEMPLATES.mcq] || [];
    templates.forEach(template => {
      allQuestions.push({ type, template });
    });
  });
  
  // If no questions available for this category, try fallback categories
  if (allQuestions.length === 0) {
    console.log(`No questions found for category: ${category}, trying fallback categories`);
    const fallbackCategories = ['programming', 'science', 'mathematics', 'history'];
    
    for (const fallbackCategory of fallbackCategories) {
      if (fallbackCategory === category) continue;
      
      questionTypes.forEach(type => {
        const templates = QUESTION_TEMPLATES[type as keyof typeof QUESTION_TEMPLATES]?.[fallbackCategory as keyof typeof QUESTION_TEMPLATES.mcq] || [];
        templates.forEach(template => {
          // Modify the question to indicate it's adapted from a different category
          const adaptedTemplate = {
            ...template,
            question: `[Adapted for ${topic}] ${template.question}`
          };
          allQuestions.push({ type, template: adaptedTemplate });
        });
      });
      
      if (allQuestions.length >= questionCount) break;
    }
  }
  
  // Shuffle all available questions
  const shuffledQuestions = shuffleArray(allQuestions);
  
  // Select unique questions up to the requested count
  for (const { type, template } of shuffledQuestions) {
    if (questions.length >= questionCount) break;
    
    const questionKey = `${type}-${template.question.substring(0, 50)}`; // Use first 50 chars as key
    
    if (!usedQuestions.has(questionKey)) {
      questions.push({
        type,
        ...template
      } as Question);
      usedQuestions.add(questionKey);
    }
  }
  
  // If we still don't have enough questions, generate variations
  if (questions.length < questionCount) {
    const questionsNeeded = questionCount - questions.length;
    const baseQuestions = shuffledQuestions.slice(0, questionsNeeded);
    
    for (let i = 0; i < questionsNeeded && i < baseQuestions.length; i++) {
      const { type, template } = baseQuestions[i];
      const variation = {
        ...template,
        question: `${template.question} (Related to ${topic})`
      };
      
      const questionKey = `${type}-variation-${i}-${template.question.substring(0, 30)}`;
      
      if (!usedQuestions.has(questionKey)) {
        questions.push({
          type,
          ...variation
        } as Question);
        usedQuestions.add(questionKey);
      }
    }
  }
  
  console.log(`Generated ${questions.length} questions for topic: ${topic}, category: ${category}`);
  return shuffleArray(questions.slice(0, questionCount));
}

// Try to get AI-generated questions using Hugging Face
async function tryHuggingFaceGeneration(prompt: string): Promise<string | null> {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.log('Hugging Face API key not found, using templates');
      return null;
    }

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
          do_sample: true,
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data[0]?.generated_text || data.generated_text || null;
    } else {
      const errorText = await response.text();
      console.log('Hugging Face API error:', response.status, errorText);
    }
  } catch (error) {
    console.log('AI generation failed, using templates:', error);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json();
    const { topic, questionCount, questionTypes, difficulty } = body;

    if (!topic || !questionCount || !questionTypes || questionTypes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (questionCount > 100 || questionCount < 1) {
      return NextResponse.json(
        { error: 'Question count must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Prepare prompt for AI
    const prompt = `Generate ${questionCount} unique quiz questions about "${topic}" with difficulty level: ${difficulty}.
Include a mix of: ${questionTypes.join(', ')} questions.
Format each question as JSON objects in an array.
For MCQ: {"type":"mcq","question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}
For Objective: {"type":"objective","question":"...","correctAnswer":"...","explanation":"..."}
For Long: {"type":"long","question":"...","keyPoints":["...","..."],"sampleAnswer":"..."}
Return only valid JSON array.`;

    // Try AI generation first (with Hugging Face)
    const responseText = await tryHuggingFaceGeneration(prompt);

    let questions: Question[] | null = null;
    if (responseText) {
      try {
        // Try to extract JSON from response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          questions = JSON.parse(responseText);
        }
        
        // Validate the questions
        if (questions && Array.isArray(questions) && questions.length > 0) {
          console.log(`Generated ${questions.length} questions using Hugging Face AI`);
        }
      } catch {
        console.log('Failed to parse AI response, falling back to templates');
        questions = null;
      }
    }

    // If AI generation failed or invalid, use templates
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      questions = generateQuestionsFromTemplates(topic, questionCount, questionTypes);
      console.log(`Generated ${questions.length} questions using templates`);
    }

    // Validate questions structure
    const validatedQuestions = (questions || []).filter((q): q is Question => {
      if (!q.type || !q.question) return false;
      
      switch (q.type) {
        case 'mcq':
          const mcqQ = q as MCQQuestion;
          return Array.isArray(mcqQ.options) && 
                 mcqQ.options.length === 4 && 
                 typeof mcqQ.correctAnswer === 'number' &&
                 mcqQ.correctAnswer >= 0 && 
                 mcqQ.correctAnswer < 4 &&
                 typeof mcqQ.explanation === 'string';
        case 'objective':
          const objQ = q as ObjectiveQuestion;
          return typeof objQ.correctAnswer === 'string' && 
                 typeof objQ.explanation === 'string';
        case 'long':
          const longQ = q as LongAnswerQuestion;
          return Array.isArray(longQ.keyPoints) && 
                 typeof longQ.sampleAnswer === 'string';
        default:
          return false;
      }
    });

    if (validatedQuestions.length === 0) {
      return NextResponse.json(
        {
          error: 'Question generation failed',
          message: 'No valid questions could be generated',
          userFriendly: 'Unable to generate questions for this topic. Please try a different topic or try again later.'
        },
        { status: 500 }
      );
    }

    // Ensure we don't return more questions than requested
    const finalQuestions = validatedQuestions.slice(0, questionCount);

    return NextResponse.json({
      questions: finalQuestions,
      metadata: {
        topic,
        difficulty,
        questionTypes,
        totalQuestions: finalQuestions.length,
        source: responseText ? 'AI' : 'Templates'
      }
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      {
        error: 'Question generation failed',
        message: 'Unexpected error generating questions',
        userFriendly: 'Something went wrong while generating questions. Please try again.'
      },
      { status: 500 }
    );
  }
}
