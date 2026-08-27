// ============================================================
// Campus OS — Interview AI Service
// Generates questions, evaluates answers, produces final reports
// Uses queryOllama() (Ollama → OpenRouter fallback)
// ============================================================
import { queryOllama } from './ollamaService';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { InterviewType, QAPair, DimensionScore, FinalReport } from '@/stores/useInterviewStore';

function getModel(): string {
  return useDesktopStore.getState().ollamaModel || 'deepseek-r1:1.5b';
}

// ---- Generate next interview question ----
export async function generateQuestion(
  interviewType: InterviewType,
  resumeData: any,
  history: QAPair[],
  difficulty: number,
  company?: string | null,
  onProgress?: (msg: string) => void
): Promise<string> {
  const resumeContext = resumeData
    ? `CANDIDATE RESUME:\nName: ${resumeData.name || 'Unknown'}\nSkills: ${(resumeData.skills || []).join(', ')}\nExperience: ${(resumeData.experience || []).map((e: any) => `${e.role} at ${e.company}`).join('; ')}\nProjects: ${(resumeData.projects || []).map((p: any) => p.name).join(', ')}\nEducation: ${(resumeData.education || []).map((e: any) => `${e.degree} from ${e.institution}`).join('; ')}`
    : 'No resume data available — ask general questions.';

  const historyContext = history.length > 0
    ? `\nPREVIOUS Q&A (${history.length} questions so far):\n${history.slice(-3).map((h, i) => `Q${i + 1}: ${h.question}\nA: ${h.answer}\nScore: ${h.score}/100`).join('\n\n')}`
    : '';

  const typeInstructions: Record<InterviewType, string> = {
    technical: 'Focus on data structures, algorithms, system design, and technical problem-solving. Ask about specific technologies from the resume.',
    behavioral: 'Ask STAR-method behavioral questions about leadership, teamwork, conflict resolution, and decision-making.',
    resume: 'Ask deep questions about specific projects, technologies used, challenges faced, and decisions made in the candidate\'s resume.',
    stress: 'Ask rapid, challenging questions. Include curveball questions and require quick thinking. Increase pressure gradually.',
  };

  const prompt = `You are a senior ${interviewType} interviewer${company ? ` at ${company}` : ''}. Your difficulty level is ${difficulty}/10.

${typeInstructions[interviewType]}

${resumeContext}
${historyContext}

Generate ONE new interview question. Do NOT repeat previous questions. Adapt difficulty based on previous answers.

Return ONLY the question text, nothing else. No numbering, no prefix.`;

  const response = await queryOllama(prompt, getModel(), onProgress, false);
  // Clean up response — remove any prefix like "Q:" or numbering
  return (response as string).replace(/^(Q\d*[:.]?\s*|Question[:.]?\s*)/i, '').trim();
}

// ---- Evaluate an answer ----
export async function evaluateAnswer(
  question: string,
  answer: string,
  interviewType: InterviewType,
  resumeData: any,
  onProgress?: (msg: string) => void
): Promise<{
  score: number;
  feedback: string;
  dimension: string;
  dimensions: Partial<DimensionScore>;
  microFeedback: string;
}> {
  const prompt = `You are evaluating an interview answer. Score it honestly.

INTERVIEW TYPE: ${interviewType}
QUESTION: ${question}
CANDIDATE ANSWER: ${answer}

Evaluate and return STRICT JSON (no markdown, no explanation outside JSON):
{
  "score": <0-100>,
  "feedback": "<1-2 sentence specific feedback>",
  "dimension": "<primary dimension: communication|technicalDepth|problemSolving|culturalFit|confidence|starUsage>",
  "dimensions": {
    "communication": <0-100>,
    "technicalDepth": <0-100>,
    "problemSolving": <0-100>,
    "culturalFit": <0-100>,
    "confidence": <0-100>,
    "starUsage": <0-100>
  },
  "microFeedback": "<short encouraging or corrective tip, max 10 words>"
}`;

  try {
    const result = await queryOllama(prompt, getModel(), onProgress, true);
    return {
      score: result.score ?? 50,
      feedback: result.feedback ?? 'No feedback available.',
      dimension: result.dimension ?? 'communication',
      dimensions: result.dimensions ?? {},
      microFeedback: result.microFeedback ?? 'Keep going!',
    };
  } catch {
    return {
      score: 50,
      feedback: 'AI could not evaluate this answer. Please continue.',
      dimension: 'communication',
      dimensions: {},
      microFeedback: 'Keep going!',
    };
  }
}

// ---- Generate final report ----
export async function generateFinalReport(
  questionHistory: QAPair[],
  interviewType: InterviewType,
  dimensions: DimensionScore,
  company?: string | null,
  onProgress?: (msg: string) => void
): Promise<FinalReport> {
  const transcript = questionHistory
    .map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}\nScore: ${q.score}/100`)
    .join('\n\n');

  const prompt = `You are an expert interview coach. Generate a final interview report.

INTERVIEW TYPE: ${interviewType}
${company ? `TARGET COMPANY: ${company}` : ''}
QUESTIONS ANSWERED: ${questionHistory.length}
DIMENSION SCORES: ${JSON.stringify(dimensions)}

FULL TRANSCRIPT:
${transcript}

Return STRICT JSON:
{
  "overallScore": <0-100>,
  "dimensions": {
    "communication": <0-100>,
    "technicalDepth": <0-100>,
    "problemSolving": <0-100>,
    "culturalFit": <0-100>,
    "confidence": <0-100>,
    "starUsage": <0-100>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvements": [
    {"title": "<title>", "description": "<actionable step>", "resource": "<optional link or resource>"},
    {"title": "<title>", "description": "<actionable step>"}
  ],
  "sentiment": "<positive|neutral|negative>"
}`;

  try {
    const result = await queryOllama(prompt, getModel(), onProgress, true);
    return {
      overallScore: result.overallScore ?? Math.round(questionHistory.reduce((s, q) => s + q.score, 0) / questionHistory.length),
      dimensions: result.dimensions ?? dimensions,
      strengths: result.strengths ?? ['Completed the interview'],
      weaknesses: result.weaknesses ?? ['Needs more practice'],
      improvements: result.improvements ?? [{ title: 'Practice more', description: 'Do more mock interviews' }],
      sentiment: result.sentiment ?? 'neutral',
    };
  } catch {
    const avgScore = Math.round(questionHistory.reduce((s, q) => s + q.score, 0) / Math.max(questionHistory.length, 1));
    return {
      overallScore: avgScore,
      dimensions,
      strengths: ['Completed the interview', 'Showed persistence'],
      weaknesses: ['AI report generation failed — review transcript manually'],
      improvements: [{ title: 'Practice more', description: 'Continue doing mock interviews to improve' }],
      sentiment: avgScore > 70 ? 'positive' : avgScore > 40 ? 'neutral' : 'negative',
    };
  }
}
