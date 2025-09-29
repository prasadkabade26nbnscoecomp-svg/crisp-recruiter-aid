import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyC7GgM5htd3mAjKga8Ary2KRX2VGbTaLig';
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async generateQuestions(candidateProfile: { name: string; email: string; resumeContent?: string }): Promise<any[]> {
    try {
      const prompt = `
Based on the candidate profile below, generate 6 interview questions for a Full Stack Developer (React/Node.js) position:

Candidate Profile:
- Name: ${candidateProfile.name}
- Email: ${candidateProfile.email}
${candidateProfile.resumeContent ? `- Resume Content: ${candidateProfile.resumeContent}` : ''}

Requirements:
- Generate exactly 6 questions
- 2 Easy questions (20 seconds each)
- 2 Medium questions (60 seconds each)  
- 2 Hard questions (120 seconds each)

Focus areas:
- React fundamentals and hooks
- Node.js and Express
- Database concepts
- System design (for hard questions)
- Problem-solving abilities

Return the response as a JSON array with this exact format:
[
  {
    "id": "q1",
    "question": "Question text here",
    "difficulty": "Easy",
    "timeLimit": 20,
    "category": "React"
  }
]

Make questions specific and relevant to full-stack development. Ensure questions test both theoretical knowledge and practical skills.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback questions if parsing fails
      return this.getFallbackQuestions();
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.getFallbackQuestions();
    }
  }

  async evaluateAnswer(question: string, answer: string, timeSpent: number, timeLimit: number): Promise<{ score: number; feedback: string }> {
    try {
      const prompt = `
Evaluate this interview answer on a scale of 0-100:

Question: ${question}
Answer: ${answer}
Time Spent: ${timeSpent} seconds (out of ${timeLimit} seconds allowed)

Evaluation Criteria:
- Technical accuracy (40%)
- Completeness of answer (30%)
- Communication clarity (20%)
- Time management (10%)

Provide:
1. A numerical score (0-100)
2. Brief feedback (2-3 sentences)

Return as JSON:
{
  "score": 85,
  "feedback": "Your feedback here"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback evaluation
      return {
        score: Math.max(0, 70 - (timeSpent > timeLimit ? 20 : 0)),
        feedback: "Answer received and evaluated."
      };
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return {
        score: 50,
        feedback: "Unable to evaluate answer due to technical issues."
      };
    }
  }

  async generateInterviewSummary(questions: any[], answers: any[], totalScore: number): Promise<string> {
    try {
      const prompt = `
Generate a comprehensive interview summary for this candidate:

Total Score: ${totalScore}/600
Questions and Answers:
${questions.map((q, i) => `
Q${i + 1} (${q.difficulty}): ${q.question}
Answer: ${answers[i]?.answer || 'No answer provided'}
Score: ${answers[i]?.score || 0}/100
`).join('\n')}

Provide:
1. Overall performance assessment
2. Strengths identified
3. Areas for improvement
4. Recommendation (Hire/Consider/Reject)

Keep it professional and constructive. Maximum 200 words.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      return `Interview completed with a score of ${totalScore}/600. Unable to generate detailed summary due to technical issues.`;
    }
  }

  private getFallbackQuestions() {
    return [
      {
        id: "q1",
        question: "What is the difference between useState and useEffect hooks in React?",
        difficulty: "Easy",
        timeLimit: 20,
        category: "React"
      },
      {
        id: "q2", 
        question: "How do you handle asynchronous operations in JavaScript?",
        difficulty: "Easy",
        timeLimit: 20,
        category: "JavaScript"
      },
      {
        id: "q3",
        question: "Explain the concept of middleware in Express.js and provide an example.",
        difficulty: "Medium",
        timeLimit: 60,
        category: "Node.js"
      },
      {
        id: "q4",
        question: "How would you implement authentication in a React application?",
        difficulty: "Medium", 
        timeLimit: 60,
        category: "React"
      },
      {
        id: "q5",
        question: "Design a REST API for a blog application. Include endpoints for users, posts, and comments.",
        difficulty: "Hard",
        timeLimit: 120,
        category: "System Design"
      },
      {
        id: "q6",
        question: "How would you optimize the performance of a React application that handles large datasets?",
        difficulty: "Hard",
        timeLimit: 120,
        category: "Performance"
      }
    ];
  }
}

export const geminiService = new GeminiService();