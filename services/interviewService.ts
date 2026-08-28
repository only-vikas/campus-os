// ============================================================
// Campus OS — Interview AI Service
// Generates questions, evaluates answers, produces final reports
// Uses queryOllama() (Ollama → OpenRouter fallback)
// Now supports: JD context, persona prompts, follow-up logic
// ============================================================
import { queryOllama } from './ollamaService';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { InterviewType, QAPair, DimensionScore, FinalReport, InterviewerPersona } from '@/stores/useInterviewStore';

function getModel(): string {
  return useDesktopStore.getState().ollamaModel || 'deepseek-r1:1.5b';
}

// ---- Persona system prompts ----
const PERSONA_PROMPTS: Record<InterviewerPersona, string> = {
  alex: `You are Alex, a calm and composed Senior Software Engineer. You listen fully before responding. You build rapport with candidates and ask thoughtful, encouraging follow-up questions. You never rush or interrupt. You are warm but professional.`,
  raj: `You are Raj, a demanding Tech Lead known for rigorous interviews. You challenge vague answers with "Can you be more specific?" or "Walk me through that more concretely." You ask tough follow-up questions and increase pressure gradually. You respect well-structured, specific answers.`,
  sofia: `You are Sofia, an empathetic HR Director who excels at behavioral and culture-fit interviews. You read between the lines and explore motivations behind answers. You often ask "Why?" and "How did that make you feel?" You are warm but insightful.`,
  priya: `You are Priya, a sharp analytical Product Manager. You are data-driven and expect metric-backed, structured answers. You probe technical depth and fact-check claims. If an answer is vague, you say "Can you quantify that?" You respect STAR-method answers.`,
};

// ---- Build document context string ----
function buildDocContext(resumeData: any, resumeText: string, jdText: string): string {
  let ctx = '';

  if (jdText) {
    ctx += `\nJOB DESCRIPTION:\n${jdText.slice(0, 1200)}\n`;
  }

  if (resumeText) {
    ctx += `\nCANDIDATE RESUME (raw text):\n${resumeText.slice(0, 1200)}\n`;
  } else if (resumeData) {
    ctx += `\nCANDIDATE RESUME (structured):\nName: ${resumeData.name || 'Unknown'}\nSkills: ${(resumeData.skills || []).join(', ')}\nExperience: ${(resumeData.experience || []).map((e: any) => `${e.role} at ${e.company}`).join('; ')}\nProjects: ${(resumeData.projects || []).map((p: any) => p.name).join(', ')}\nEducation: ${(resumeData.education || []).map((e: any) => `${e.degree} from ${e.institution}`).join('; ')}\n`;
  }

  if (!jdText && !resumeText && !resumeData) {
    ctx = '\nNo resume or job description provided — ask general interview questions.\n';
  }

  return ctx;
}

// ---- Detect follow-up triggers in an answer ----
function detectFollowUpTriggers(answer: string, jdText: string, resumeText: string): string {
  const triggers: string[] = [];
  
  // Common follow-up words: specific technologies, projects, achievements
  const keywords = [
    ...answer.match(/\b(built|developed|designed|led|created|implemented|managed|improved|reduced|increased|optimized)\b[^.]{0,40}/gi) || [],
    ...answer.match(/\b(software|system|application|platform|api|database|algorithm)\b/gi) || [],
  ];

  if (keywords.length > 0) {
    triggers.push(`The candidate mentioned: "${keywords.slice(0, 2).join('", "')}" — ask a follow-up probing this specific claim.`);
  }
  
  return triggers.join(' ');
}

// ---- Generate next interview question ----
export async function generateQuestion(
  interviewType: InterviewType,
  resumeData: any,
  history: QAPair[],
  difficulty: number,
  company?: string | null,
  persona?: InterviewerPersona,
  jdText?: string,
  resumeText?: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  const personaKey = persona || 'alex';
  const personaPrompt = PERSONA_PROMPTS[personaKey];
  const docContext = buildDocContext(resumeData, resumeText || '', jdText || '');

  // First question is always "Tell me about yourself"
  if (history.length === 0) {
    return `Hi there! Let's get started. Tell me about yourself — your background, what you've been working on recently, and what excites you about this opportunity.`;
  }

  const historyContext = history.length > 0
    ? `\nCONVERSATION SO FAR (last 3):\n${history.slice(-3).map((h, i) => `Q: ${h.question}\nA: ${h.answer}\nScore: ${h.score}/100`).join('\n\n')}`
    : '';

  // Detect follow-up opportunities from last answer
  const lastAnswer = history[history.length - 1]?.answer || '';
  const followUpHint = detectFollowUpTriggers(lastAnswer, jdText || '', resumeText || '');

  const typeInstructions: Record<InterviewType, string> = {
    technical: 'Focus on data structures, algorithms, system design, and specific technologies from the JD and resume. Probe technical depth.',
    behavioral: 'Ask STAR-method behavioral questions about leadership, teamwork, conflict resolution, and decision-making. Relate to the JD requirements.',
    resume: 'Ask deep questions about specific projects, technologies used, challenges faced, and decisions made that appear in the resume. Cross-reference with JD requirements.',
    stress: 'Ask rapid, challenging questions. Include curveball questions. Occasionally challenge the candidate\'s previous answers. Increase pressure.',
  };

  const prompt = `${personaPrompt}

You are interviewing a candidate${company ? ` for a position at ${company}` : ''}.
Your difficulty level is ${difficulty}/10.
Interview type: ${interviewType.toUpperCase()}.

${typeInstructions[interviewType]}

IMPORTANT RULES:
- Questions MUST be relevant to the overlap of the candidate's resume AND the job description.
- ${followUpHint || 'Ask a question based on the most important requirement in the job description.'}
- Do NOT repeat previous questions.
- Ask ONE focused question only.
- Keep the question conversational, not robotic.
${docContext}
${historyContext}

Return ONLY the question text. No numbering, no prefix, no explanation.`;

  const response = await queryOllama(prompt, getModel(), onProgress, false);
  return (response as string).replace(/^(Q\d*[:.]?\s*|Question[:.]?\s*)/i, '').trim();
}

// ---- Evaluate an answer ----
export async function evaluateAnswer(
  question: string,
  answer: string,
  interviewType: InterviewType,
  resumeData: any,
  persona?: InterviewerPersona,
  jdText?: string,
  resumeText?: string,
  onProgress?: (msg: string) => void
): Promise<{
  score: number;
  feedback: string;
  dimension: string;
  dimensions: Partial<DimensionScore>;
  microFeedback: string;
}> {
  const docContext = buildDocContext(resumeData, resumeText || '', jdText || '');

  const prompt = `You are evaluating an interview answer. Be honest and rigorous.

INTERVIEW TYPE: ${interviewType}
QUESTION: ${question}
CANDIDATE ANSWER: ${answer}
${docContext}

Evaluate and return STRICT JSON (no markdown, no explanation outside JSON):
{
  "score": <0-100>,
  "feedback": "<1-2 sentence specific feedback mentioning what was good and what was missing>",
  "dimension": "<primary dimension: communication|technicalDepth|problemSolving|culturalFit|confidence|starUsage>",
  "dimensions": {
    "communication": <0-100>,
    "technicalDepth": <0-100>,
    "problemSolving": <0-100>,
    "culturalFit": <0-100>,
    "confidence": <0-100>,
    "starUsage": <0-100>
  },
  "microFeedback": "<short encouraging or corrective tip, max 12 words>"
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
  persona?: InterviewerPersona,
  jdText?: string,
  resumeText?: string,
  onProgress?: (msg: string) => void
): Promise<FinalReport> {
  const transcript = questionHistory
    .map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}\nScore: ${q.score}/100`)
    .join('\n\n');

  const docSnippet = jdText ? `\nJOB DESCRIPTION SNIPPET:\n${jdText.slice(0, 400)}` : '';

  const prompt = `You are an expert interview coach. Generate a final interview report.

INTERVIEW TYPE: ${interviewType}
${company ? `TARGET COMPANY: ${company}` : ''}
QUESTIONS ANSWERED: ${questionHistory.length}
DIMENSION SCORES: ${JSON.stringify(dimensions)}
${docSnippet}

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
    {"title": "<title>", "description": "<actionable step>", "resource": "<optional resource>"},
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
