'use client';
// ============================================================
// Campus OS — NovaMind Knowledge Trace
// Bayesian quiz engine: pick skill → AI quiz → BKT update
// ============================================================
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, XCircle, Loader2, RotateCcw, ChevronRight } from 'lucide-react';
import { useNovaMindStore } from '@/stores/useNovaMindStore';
import { SKILL_TAXONOMY, CATEGORY_META } from '@/data/novamind/skillTaxonomy';
import type { SkillCategory, QuizQuestion } from '@/types/novamind';

type QuizState = 'pick' | 'loading' | 'question' | 'result' | 'summary';

// Fallback static questions per skill
const FALLBACK_QUESTIONS: Record<string, QuizQuestion[]> = {
  python: [
    { question: 'What does a Python list comprehension `[x*2 for x in range(5)]` produce?', options: ['[0,2,4,6,8]', '[0,1,2,3,4]', '[2,4,6,8,10]', '[1,2,3,4,5]'], correctIndex: 0, explanation: 'range(5) gives 0-4, multiplied by 2 → [0,2,4,6,8]', skillId: 'python' },
    { question: 'Which keyword is used to define a generator in Python?', options: ['return', 'yield', 'async', 'generate'], correctIndex: 1, explanation: '`yield` makes a function a generator, returning values lazily.', skillId: 'python' },
    { question: 'What is the time complexity of dict lookup in Python?', options: ['O(n)', 'O(log n)', 'O(1) average', 'O(n²)'], correctIndex: 2, explanation: 'Python dicts use hash tables, giving O(1) average-case lookup.', skillId: 'python' },
  ],
  javascript: [
    { question: 'What does `typeof null` return in JavaScript?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctIndex: 2, explanation: 'This is a famous JS quirk — typeof null returns "object" due to a legacy bug.', skillId: 'javascript' },
    { question: 'What is the output of `[] + []`?', options: ['[]', '""', '0', 'undefined'], correctIndex: 1, explanation: 'Array + Array coerces both to strings ("") and concatenates them → ""', skillId: 'javascript' },
    { question: 'What does `Promise.all()` do?', options: ['Runs promises sequentially', 'Resolves when first promise resolves', 'Resolves when all promises resolve', 'Ignores rejections'], correctIndex: 2, explanation: 'Promise.all() waits for all promises; rejects immediately if any one fails.', skillId: 'javascript' },
  ],
  dsa: [
    { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctIndex: 1, explanation: 'Binary search halves the search space each time → O(log n)', skillId: 'dsa' },
    { question: 'Which data structure uses LIFO (Last-In, First-Out)?', options: ['Queue', 'Stack', 'Heap', 'Linked List'], correctIndex: 1, explanation: 'Stack follows LIFO — last element pushed is first to be popped.', skillId: 'dsa' },
    { question: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctIndex: 2, explanation: 'Merge sort requires O(n) auxiliary space for the merge step.', skillId: 'dsa' },
  ],
};

const DEFAULT_QUESTIONS = (skillId: string): QuizQuestion[] => [
  {
    question: `What is the primary benefit of learning ${skillId.replace(/-/g, ' ')}?`,
    options: ['Career advancement', 'Problem-solving ability', 'Both A and B', 'Neither'],
    correctIndex: 2,
    explanation: 'Learning technical skills helps both career growth and problem-solving ability.',
    skillId,
  },
];

export default function KnowledgeTrace() {
  const { skillMastery, recordQuizAnswer, knowledgeNodes } = useNovaMindStore();
  const [quizState, setQuizState] = useState<QuizState>('pick');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [results, setResults] = useState<{ correct: boolean; question: QuizQuestion }[]>([]);
  const [filterCat, setFilterCat] = useState<SkillCategory | 'all'>('all');

  const startQuiz = useCallback(async (skillId: string) => {
    setSelectedSkillId(skillId);
    setQuizState('loading');
    setCurrentQ(0);
    setSelectedAnswer(null);
    setResults([]);

    // Use fallback questions first
    const fallback = FALLBACK_QUESTIONS[skillId] ?? DEFAULT_QUESTIONS(skillId);
    setQuestions(fallback);
    setQuizState('question');
  }, []);

  const handleAnswer = (answerIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIdx);
    const q = questions[currentQ];
    const correct = answerIdx === q.correctIndex;
    recordQuizAnswer(q.skillId, correct);
    setResults((r) => [...r, { correct, question: q }]);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setQuizState('summary');
    } else {
      setCurrentQ((n) => n + 1);
      setSelectedAnswer(null);
    }
  };

  const restart = () => {
    setQuizState('pick');
    setSelectedSkillId(null);
    setResults([]);
    setCurrentQ(0);
    setSelectedAnswer(null);
  };

  const trackedSkills = SKILL_TAXONOMY.filter((s) =>
    (filterCat === 'all' || s.category === filterCat)
  );

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence mode="wait">
        {/* ── Skill Picker ── */}
        {quizState === 'pick' && (
          <motion.div
            key="pick"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <div className="flex-shrink-0 p-5 border-b border-[rgba(51,65,85,0.4)]">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={18} className="text-[#a78bfa]" />
                <h2 className="font-bold text-[#e2e8f0]">Knowledge Trace</h2>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Select a skill to test your knowledge. The AI uses Bayesian Knowledge Tracing to update your mastery after each quiz.
              </p>
              {/* Cat filter */}
              <div className="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1">
                {['all', ...Object.keys(CATEGORY_META)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat as any)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                      filterCat === cat
                        ? 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/30'
                        : 'text-[#94a3b8] border-[rgba(51,65,85,0.4)]'
                    }`}
                  >
                    {cat === 'all' ? '🌐 All' : `${CATEGORY_META[cat as SkillCategory].icon} ${CATEGORY_META[cat as SkillCategory].label}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {trackedSkills.map((skill) => {
                  const mastery = skillMastery[skill.id]?.mastery ?? 0;
                  const bkt = knowledgeNodes[skill.id]?.bkt.pKnown ?? 0;
                  const meta = CATEGORY_META[skill.category];
                  return (
                    <motion.button
                      key={skill.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startQuiz(skill.id)}
                      className="text-left p-3 rounded-xl border border-[rgba(51,65,85,0.4)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(167,139,250,0.3)] hover:bg-[rgba(167,139,250,0.05)] transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{skill.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#e2e8f0] truncate">{skill.name}</p>
                          <p className="text-[10px]" style={{ color: meta.color }}>{meta.label}</p>
                        </div>
                        <ChevronRight size={12} className="text-[#475569]" />
                      </div>
                      <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${mastery}%`, background: meta.color }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-[#475569]">Mastery: {mastery}%</span>
                        <span className="text-[10px] text-[#475569]">BKT: {Math.round(bkt * 100)}%</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {quizState === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4"
          >
            <Loader2 size={40} className="animate-spin text-[#a78bfa]" />
            <p className="text-[#94a3b8] text-sm">Generating questions...</p>
          </motion.div>
        )}

        {/* ── Question ── */}
        {quizState === 'question' && questions[currentQ] && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="flex flex-col h-full p-6"
          >
            {/* Progress */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-[#94a3b8]">Question {currentQ + 1} of {questions.length}</p>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`w-6 h-1 rounded-full ${i <= currentQ ? 'bg-[#a78bfa]' : 'bg-[#1e293b]'}`} />
                ))}
              </div>
              <button onClick={restart} className="text-[10px] text-[#475569] hover:text-[#94a3b8]">Exit</button>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
              <motion.p
                className="text-base font-semibold text-[#e2e8f0] mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {questions[currentQ].question}
              </motion.p>

              <div className="space-y-3">
                {questions[currentQ].options.map((opt, i) => {
                  let bg = 'bg-[rgba(255,255,255,0.03)] border-[rgba(51,65,85,0.4)] hover:border-[rgba(167,139,250,0.4)]';
                  let icon = null;
                  if (selectedAnswer !== null) {
                    if (i === questions[currentQ].correctIndex) {
                      bg = 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.4)]';
                      icon = <CheckCircle2 size={16} className="text-[#22c55e]" />;
                    } else if (i === selectedAnswer) {
                      bg = 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.4)]';
                      icon = <XCircle size={16} className="text-[#ef4444]" />;
                    }
                  }

                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswer(i)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm transition-all ${bg}`}
                    >
                      <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px] font-bold text-[#475569]">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="flex-1 text-[#e2e8f0]">{opt}</span>
                      {icon}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 rounded-xl bg-[rgba(167,139,250,0.06)] border border-[rgba(167,139,250,0.2)]"
                  >
                    <p className="text-xs text-[#94a3b8] leading-relaxed">
                      <span className="text-[#a78bfa] font-semibold">Explanation: </span>
                      {questions[currentQ].explanation}
                    </p>
                    <button
                      onClick={nextQuestion}
                      className="mt-3 flex items-center gap-1.5 text-xs text-[#a78bfa] hover:gap-2.5 transition-all font-medium"
                    >
                      {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'}
                      <ChevronRight size={13} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Summary ── */}
        {quizState === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full p-8 gap-5"
          >
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, times: [0, 0.5, 1] }}
            >
              {results.filter((r) => r.correct).length === results.length ? '🎉' : results.filter((r) => r.correct).length >= results.length / 2 ? '💪' : '📚'}
            </motion.div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-[#e2e8f0]">
                {results.filter((r) => r.correct).length}/{results.length} Correct
              </h3>
              <p className="text-sm text-[#94a3b8] mt-1">
                Your mastery has been updated using Bayesian Knowledge Tracing
              </p>
            </div>

            {/* Result breakdown */}
            <div className="w-full max-w-sm space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm ${r.correct ? 'border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)]' : 'border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)]'}`}>
                  {r.correct ? <CheckCircle2 size={14} className="text-[#22c55e]" /> : <XCircle size={14} className="text-[#ef4444]" />}
                  <p className="text-xs text-[#94a3b8] line-clamp-1">{r.question.question}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => startQuiz(selectedSkillId!)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/30 hover:bg-[#a78bfa]/30 transition-colors"
              >
                <RotateCcw size={14} /> Retry
              </button>
              <button
                onClick={restart}
                className="px-4 py-2 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] text-[#94a3b8] border border-[rgba(51,65,85,0.4)] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              >
                New Skill
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
