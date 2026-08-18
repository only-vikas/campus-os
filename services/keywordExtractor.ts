const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'go', 'rust',
  'react', 'vue', 'angular', 'svelte', 'next.js', 'node.js',
  'mongodb', 'postgresql', 'mysql', 'redis', 'firebase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
  'git', 'github', 'gitlab', 'jira', 'confluence',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch',
  'data analysis', 'sql', 'pandas', 'numpy', 'tableau',
  'agile', 'scrum', 'kanban', 'ci/cd', 'devops'
];

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return SKILL_KEYWORDS.filter(kw => lower.includes(kw.toLowerCase()));
}

export function compareKeywords(resumeText: string, jdText: string) {
  if (!resumeText || !jdText) return { matched: [], missing: [], score: 0 };
  const resumeKws = extractKeywords(resumeText);
  const jdKws = extractKeywords(jdText);
  if (jdKws.length === 0) return { matched: [], missing: [], score: 0 };
  
  const matched = jdKws.filter(kw => resumeKws.includes(kw));
  const missing = jdKws.filter(kw => !resumeKws.includes(kw));
  return { matched, missing, score: Math.round((matched.length / jdKws.length) * 100) };
}
