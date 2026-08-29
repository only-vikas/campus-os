import { queryOllama } from './ollamaService';

export async function generateFinancialSummary(
  transactions: any[], 
  onProgress?: (msg: string) => void
): Promise<string> {
  const prompt = `You are EduVault, an AI financial advisor for Indian college students. 
  
Analyze this transaction data and provide a short, encouraging summary of their spending habits (under 100 words). Point out one good thing and one area for improvement.

Data:
${JSON.stringify(transactions.slice(0, 50))} // Sending last 50 for context

Format: Return ONLY the text summary, no markdown, no json.`;

  return queryOllama(prompt, 'deepseek-r1:1.5b', onProgress, false);
}

export async function checkAnomalies(
  transactions: any[],
  onProgress?: (msg: string) => void
): Promise<{ date: string; category: string; amount: number; reason: string }[]> {
  const prompt = `You are a financial anomaly detector.
  
Analyze these recent transactions. Identify any that seem unusually high or out of place for a typical student (e.g., spending ₹5000 on Food in one day, or a weird category spike). 

Data:
${JSON.stringify(transactions.slice(0, 20))}

Return a JSON array of objects with keys: "date", "category", "amount", "reason" (why it's anomalous). If none, return empty array [].`;

  const result = await queryOllama(prompt, 'deepseek-r1:1.5b', onProgress, true);
  return Array.isArray(result) ? result : [];
}

export async function askFinancialQuestion(
  question: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  const prompt = `You are EduVault, an AI financial advisor for Indian college students.
  Answer the following question practically and concisely (under 3 sentences).
  
  Question: ${question}`;
  
  return queryOllama(prompt, 'deepseek-r1:1.5b', onProgress, false);
}
