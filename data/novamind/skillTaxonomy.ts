// ============================================================
// Campus OS — NovaMind Skill Taxonomy
// Master ontology: ~60 skills across 6 categories
// ============================================================
import type { Skill, SkillCategory } from '@/types/novamind';

export const SKILL_TAXONOMY: Skill[] = [
  // ── Programming ───────────────────────────────────────────
  { id: 'python', name: 'Python', category: 'programming', icon: '🐍', color: '#60a5fa', prerequisites: [], description: 'General-purpose scripting and data language', tags: ['backend', 'data', 'automation'] },
  { id: 'javascript', name: 'JavaScript', category: 'programming', icon: '🌐', color: '#fbbf24', prerequisites: [], description: 'The language of the web', tags: ['frontend', 'fullstack'] },
  { id: 'typescript', name: 'TypeScript', category: 'programming', icon: '💙', color: '#3b82f6', prerequisites: ['javascript'], description: 'Typed superset of JavaScript', tags: ['frontend', 'fullstack'] },
  { id: 'java', name: 'Java', category: 'programming', icon: '☕', color: '#f97316', prerequisites: [], description: 'Enterprise object-oriented language', tags: ['backend', 'android'] },
  { id: 'cpp', name: 'C++', category: 'programming', icon: '⚙️', color: '#94a3b8', prerequisites: [], description: 'Systems and performance-critical code', tags: ['systems', 'competitive'] },
  { id: 'go', name: 'Go', category: 'programming', icon: '🐹', color: '#22d3ee', prerequisites: [], description: 'Fast, concurrent systems language', tags: ['backend', 'cloud'] },
  { id: 'rust', name: 'Rust', category: 'programming', icon: '🦀', color: '#f59e0b', prerequisites: ['cpp'], description: 'Memory-safe systems language', tags: ['systems', 'wasm'] },
  { id: 'sql', name: 'SQL', category: 'programming', icon: '🗄️', color: '#a78bfa', prerequisites: [], description: 'Structured query language for databases', tags: ['database', 'backend'] },
  { id: 'dsa', name: 'Data Structures & Algorithms', category: 'programming', icon: '🔢', color: '#f472b6', prerequisites: ['python'], description: 'Core CS fundamentals for problem solving', tags: ['competitive', 'interviews'] },
  { id: 'system-design', name: 'System Design', category: 'programming', icon: '🏗️', color: '#fb923c', prerequisites: ['dsa', 'sql'], description: 'Designing scalable distributed systems', tags: ['interviews', 'senior'] },

  // ── Frameworks ────────────────────────────────────────────
  { id: 'react', name: 'React', category: 'frameworks', icon: '⚛️', color: '#22d3ee', prerequisites: ['javascript', 'typescript'], description: 'UI library for building web interfaces', tags: ['frontend'] },
  { id: 'nextjs', name: 'Next.js', category: 'frameworks', icon: '▲', color: '#e2e8f0', prerequisites: ['react'], description: 'React framework with SSR and routing', tags: ['frontend', 'fullstack'] },
  { id: 'nodejs', name: 'Node.js', category: 'frameworks', icon: '🟢', color: '#22c55e', prerequisites: ['javascript'], description: 'JavaScript runtime for server-side apps', tags: ['backend'] },
  { id: 'fastapi', name: 'FastAPI', category: 'frameworks', icon: '⚡', color: '#10b981', prerequisites: ['python'], description: 'Modern Python web framework', tags: ['backend', 'api'] },
  { id: 'django', name: 'Django', category: 'frameworks', icon: '🎸', color: '#065f46', prerequisites: ['python'], description: 'Full-featured Python web framework', tags: ['backend', 'fullstack'] },
  { id: 'expressjs', name: 'Express.js', category: 'frameworks', icon: '🚂', color: '#94a3b8', prerequisites: ['nodejs'], description: 'Minimal Node.js web framework', tags: ['backend'] },
  { id: 'react-native', name: 'React Native', category: 'frameworks', icon: '📱', color: '#60a5fa', prerequisites: ['react'], description: 'Cross-platform mobile framework', tags: ['mobile'] },
  { id: 'flutter', name: 'Flutter', category: 'frameworks', icon: '🦋', color: '#38bdf8', prerequisites: [], description: 'Google cross-platform UI toolkit', tags: ['mobile'] },
  { id: 'spring', name: 'Spring Boot', category: 'frameworks', icon: '🌱', color: '#22c55e', prerequisites: ['java'], description: 'Java enterprise framework', tags: ['backend'] },
  { id: 'langchain', name: 'LangChain', category: 'frameworks', icon: '🔗', color: '#a78bfa', prerequisites: ['python'], description: 'LLM application development framework', tags: ['ai', 'rag'] },

  // ── Data Science ──────────────────────────────────────────
  { id: 'ml', name: 'Machine Learning', category: 'data-science', icon: '🤖', color: '#a78bfa', prerequisites: ['python', 'sql'], description: 'Statistical learning and predictive models', tags: ['ai', 'data'] },
  { id: 'deep-learning', name: 'Deep Learning', category: 'data-science', icon: '🧠', color: '#c084fc', prerequisites: ['ml'], description: 'Neural networks and representation learning', tags: ['ai'] },
  { id: 'nlp', name: 'Natural Language Processing', category: 'data-science', icon: '💬', color: '#f472b6', prerequisites: ['ml'], description: 'Text understanding and generation', tags: ['ai', 'llm'] },
  { id: 'data-analysis', name: 'Data Analysis', category: 'data-science', icon: '📊', color: '#60a5fa', prerequisites: ['python', 'sql'], description: 'Exploratory analysis with pandas/numpy', tags: ['data'] },
  { id: 'data-viz', name: 'Data Visualization', category: 'data-science', icon: '📈', color: '#fb923c', prerequisites: ['data-analysis'], description: 'Matplotlib, Seaborn, Plotly charts', tags: ['data'] },
  { id: 'llm', name: 'LLM Engineering', category: 'data-science', icon: '✨', color: '#fbbf24', prerequisites: ['nlp', 'langchain'], description: 'Fine-tuning, RAG, and prompt engineering', tags: ['ai', 'llm'] },
  { id: 'computer-vision', name: 'Computer Vision', category: 'data-science', icon: '👁️', color: '#34d399', prerequisites: ['deep-learning'], description: 'Image recognition and object detection', tags: ['ai'] },
  { id: 'statistics', name: 'Statistics & Probability', category: 'data-science', icon: '📐', color: '#e879f9', prerequisites: [], description: 'Foundation for data science and ML', tags: ['data', 'math'] },

  // ── Soft Skills ───────────────────────────────────────────
  { id: 'communication', name: 'Communication', category: 'soft-skills', icon: '🗣️', color: '#34d399', prerequisites: [], description: 'Clear and effective verbal/written expression', tags: ['career', 'leadership'] },
  { id: 'problem-solving', name: 'Problem Solving', category: 'soft-skills', icon: '💡', color: '#fbbf24', prerequisites: [], description: 'Structured approach to complex challenges', tags: ['career', 'interviews'] },
  { id: 'teamwork', name: 'Teamwork & Collaboration', category: 'soft-skills', icon: '🤝', color: '#60a5fa', prerequisites: [], description: 'Working effectively in teams', tags: ['career'] },
  { id: 'leadership', name: 'Leadership', category: 'soft-skills', icon: '👑', color: '#f59e0b', prerequisites: ['communication', 'teamwork'], description: 'Guiding and inspiring teams', tags: ['career', 'senior'] },
  { id: 'time-management', name: 'Time Management', category: 'soft-skills', icon: '⏱️', color: '#94a3b8', prerequisites: [], description: 'Prioritization and productivity', tags: ['career'] },
  { id: 'critical-thinking', name: 'Critical Thinking', category: 'soft-skills', icon: '🎯', color: '#a78bfa', prerequisites: [], description: 'Analytical reasoning and decision making', tags: ['career', 'interviews'] },

  // ── Finance ───────────────────────────────────────────────
  { id: 'personal-finance', name: 'Personal Finance', category: 'finance', icon: '💰', color: '#34d399', prerequisites: [], description: 'Budgeting, savings, and financial planning', tags: ['finance'] },
  { id: 'investing', name: 'Investing Basics', category: 'finance', icon: '📈', color: '#10b981', prerequisites: ['personal-finance'], description: 'Stock markets, mutual funds, SIP', tags: ['finance'] },
  { id: 'trading', name: 'Trading Strategies', category: 'finance', icon: '📊', color: '#22d3ee', prerequisites: ['investing'], description: 'Technical analysis and swing trading', tags: ['finance'] },
  { id: 'options', name: 'Options & Derivatives', category: 'finance', icon: '🎯', color: '#f472b6', prerequisites: ['trading'], description: 'Options strategies and risk management', tags: ['finance', 'advanced'] },
  { id: 'tax', name: 'Tax & Compliance', category: 'finance', icon: '🧾', color: '#fbbf24', prerequisites: ['personal-finance'], description: 'Income tax, GST, and filing basics', tags: ['finance'] },

  // ── DevOps ────────────────────────────────────────────────
  { id: 'git', name: 'Git & Version Control', category: 'devops', icon: '🌿', color: '#f97316', prerequisites: [], description: 'Distributed version control system', tags: ['devops', 'essential'] },
  { id: 'docker', name: 'Docker', category: 'devops', icon: '🐳', color: '#38bdf8', prerequisites: ['git'], description: 'Containerization and Docker Compose', tags: ['devops', 'cloud'] },
  { id: 'kubernetes', name: 'Kubernetes', category: 'devops', icon: '☸️', color: '#60a5fa', prerequisites: ['docker'], description: 'Container orchestration at scale', tags: ['devops', 'cloud'] },
  { id: 'ci-cd', name: 'CI/CD Pipelines', category: 'devops', icon: '🔄', color: '#22d3ee', prerequisites: ['git', 'docker'], description: 'GitHub Actions, Jenkins, automation', tags: ['devops'] },
  { id: 'cloud', name: 'Cloud (AWS/GCP/Azure)', category: 'devops', icon: '☁️', color: '#a78bfa', prerequisites: ['docker'], description: 'Cloud platforms and managed services', tags: ['devops', 'cloud'] },
  { id: 'monitoring', name: 'Monitoring & Observability', category: 'devops', icon: '📡', color: '#fb923c', prerequisites: ['cloud'], description: 'Logging, metrics, and alerting', tags: ['devops', 'senior'] },
  { id: 'linux', name: 'Linux & Shell', category: 'devops', icon: '🐧', color: '#94a3b8', prerequisites: [], description: 'Command line, bash scripting, system admin', tags: ['devops', 'essential'] },
];

export const CATEGORY_META: Record<SkillCategory, { label: string; icon: string; color: string; gradient: string }> = {
  programming:  { label: 'Programming',   icon: '💻', color: '#60a5fa', gradient: 'from-blue-500/20 to-blue-600/5' },
  frameworks:   { label: 'Frameworks',    icon: '⚡', color: '#34d399', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  'data-science': { label: 'Data Science', icon: '🤖', color: '#a78bfa', gradient: 'from-purple-500/20 to-purple-600/5' },
  'soft-skills': { label: 'Soft Skills',  icon: '🤝', color: '#fbbf24', gradient: 'from-amber-500/20 to-amber-600/5' },
  finance:      { label: 'Finance',        icon: '💰', color: '#10b981', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  devops:       { label: 'DevOps',         icon: '🔧', color: '#f472b6', gradient: 'from-pink-500/20 to-pink-600/5' },
};

export const SKILL_MAP = new Map(SKILL_TAXONOMY.map((s) => [s.id, s]));
