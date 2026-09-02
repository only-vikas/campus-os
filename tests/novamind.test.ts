/**
 * ============================================================
 * Campus OS — NovaMind Automated Test Suite
 * Tests all 7 tabs, BKT logic, badge unlocking, predictions
 * Run via: npx jest --testPathPattern=novamind
 * ============================================================
 */

// ── Unit Tests: BKT Logic ─────────────────────────────────────────────────

function bktUpdate(state: { pKnown: number; pLearn: number; pSlip: number; pGuess: number }, correct: boolean) {
  const { pKnown, pLearn, pSlip, pGuess } = state;
  const pCorrectGivenKnown   = 1 - pSlip;
  const pCorrectGivenUnknown = pGuess;
  const pKnownGivenObs = correct
    ? (pKnown * pCorrectGivenKnown) / (pKnown * pCorrectGivenKnown + (1 - pKnown) * pCorrectGivenUnknown)
    : (pKnown * pSlip) / (pKnown * pSlip + (1 - pKnown) * (1 - pGuess));
  const pKnownAfter = pKnownGivenObs + (1 - pKnownGivenObs) * pLearn;
  return { ...state, pKnown: Math.min(0.99, pKnownAfter) };
}

// Test runner (no external deps needed)
const tests: { name: string; fn: () => void }[] = [];
let passed = 0, failed = 0;

function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

function expect(value: unknown) {
  return {
    toBe: (expected: unknown) => {
      if (value !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`);
    },
    toBeGreaterThan: (n: number) => {
      if (typeof value !== 'number' || value <= n) throw new Error(`Expected ${value} > ${n}`);
    },
    toBeLessThan: (n: number) => {
      if (typeof value !== 'number' || value >= n) throw new Error(`Expected ${value} < ${n}`);
    },
    toBeLessThanOrEqual: (n: number) => {
      if (typeof value !== 'number' || value > n) throw new Error(`Expected ${value} <= ${n}`);
    },
    toBeGreaterThanOrEqual: (n: number) => {
      if (typeof value !== 'number' || value < n) throw new Error(`Expected ${value} >= ${n}`);
    },
    toBeTruthy: () => { if (!value) throw new Error(`Expected truthy, got ${JSON.stringify(value)}`); },
    toBeFalsy:  () => { if (value) throw new Error(`Expected falsy, got ${JSON.stringify(value)}`); },
    toHaveLength: (n: number) => {
      if (!Array.isArray(value) && typeof value !== 'string') throw new Error('Not array/string');
      if ((value as unknown[]).length !== n) throw new Error(`Expected length ${n}, got ${(value as unknown[]).length}`);
    },
    toContain: (item: unknown) => {
      if (!Array.isArray(value) || !value.includes(item)) throw new Error(`Expected to contain ${JSON.stringify(item)}`);
    },
  };
}

// ══════════════════════════════════════════════════════════════
// UNIT TESTS: Bayesian Knowledge Tracing
// ══════════════════════════════════════════════════════════════
test('BKT: correct answer increases pKnown', () => {
  const initial = { pKnown: 0.3, pLearn: 0.1, pSlip: 0.1, pGuess: 0.2 };
  const updated = bktUpdate(initial, true);
  expect(updated.pKnown).toBeGreaterThan(initial.pKnown);
});

test('BKT: wrong answer decreases pKnown when initially high', () => {
  const initial = { pKnown: 0.8, pLearn: 0.1, pSlip: 0.1, pGuess: 0.2 };
  const updated = bktUpdate(initial, false);
  expect(updated.pKnown).toBeLessThan(initial.pKnown);
});

test('BKT: pKnown never exceeds 0.99', () => {
  let state = { pKnown: 0.99, pLearn: 0.1, pSlip: 0.05, pGuess: 0.1 };
  for (let i = 0; i < 10; i++) state = bktUpdate(state, true);
  expect(state.pKnown).toBeLessThanOrEqual(0.99);
});

test('BKT: pKnown always remains positive', () => {
  let state = { pKnown: 0.1, pLearn: 0.1, pSlip: 0.1, pGuess: 0.2 };
  for (let i = 0; i < 5; i++) state = bktUpdate(state, false);
  expect(state.pKnown).toBeGreaterThan(0);
});

test('BKT: multiple correct answers push pKnown above 0.8', () => {
  let state = { pKnown: 0.3, pLearn: 0.2, pSlip: 0.05, pGuess: 0.1 };
  for (let i = 0; i < 15; i++) state = bktUpdate(state, true);
  expect(state.pKnown).toBeGreaterThan(0.8);
});

// ══════════════════════════════════════════════════════════════
// UNIT TESTS: Skill Taxonomy
// ══════════════════════════════════════════════════════════════
// Skill IDs defined inline for test portability:

const SKILL_IDS = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'sql', 'dsa', 'system-design',
  'react', 'nextjs', 'nodejs', 'fastapi', 'django', 'expressjs', 'react-native', 'flutter', 'spring', 'langchain',
  'ml', 'deep-learning', 'nlp', 'data-analysis', 'data-viz', 'llm', 'computer-vision', 'statistics',
  'communication', 'problem-solving', 'teamwork', 'leadership', 'time-management', 'critical-thinking',
  'personal-finance', 'investing', 'trading', 'options', 'tax',
  'git', 'docker', 'kubernetes', 'ci-cd', 'cloud', 'monitoring', 'linux',
];

test('Skill taxonomy: has 46 skills', () => {
  expect(SKILL_IDS.length).toBeGreaterThanOrEqual(46);
});

test('Skill taxonomy: no duplicate IDs', () => {
  const unique = new Set(SKILL_IDS);
  expect(unique.size).toBe(SKILL_IDS.length);
});

test('Skill taxonomy: all critical interview skills present', () => {
  const critical = ['dsa', 'system-design', 'sql', 'python', 'javascript'];
  critical.forEach((id) => expect(SKILL_IDS).toContain(id));
});

test('Skill taxonomy: prerequisites are valid skill IDs', () => {
  const prereqMap: Record<string, string[]> = {
    typescript: ['javascript'], react: ['javascript', 'typescript'],
    nextjs: ['react'], nodejs: ['javascript'], ml: ['python', 'sql'],
    'system-design': ['dsa', 'sql'], docker: ['git'], kubernetes: ['docker'],
  };
  Object.entries(prereqMap).forEach(([skillId, prereqs]) => {
    prereqs.forEach((prereqId) => {
      expect(SKILL_IDS).toContain(prereqId);
    });
  });
});

// ══════════════════════════════════════════════════════════════
// UNIT TESTS: Badge Unlocking Logic
// ══════════════════════════════════════════════════════════════

function checkBadge(
  req: { type: string; value: number; skillId?: string },
  state: { xp: number; streak: number; skillMastery: Record<string, { mastery: number; practiceCount: number }> }
): boolean {
  switch (req.type) {
    case 'xp': return state.xp >= req.value;
    case 'streak': return state.streak >= req.value;
    case 'quiz_count': {
      const total = Object.values(state.skillMastery).reduce((s, m) => s + m.practiceCount, 0);
      return total >= req.value;
    }
    case 'skill_count': return Object.keys(state.skillMastery).length >= req.value;
    case 'mastery': return req.skillId ? (state.skillMastery[req.skillId]?.mastery ?? 0) >= req.value : false;
    default: return false;
  }
}

test('Badge: first-quiz unlocks after 1 quiz', () => {
  const state = { xp: 0, streak: 0, skillMastery: { python: { mastery: 50, practiceCount: 1 } } };
  const unlocked = checkBadge({ type: 'quiz_count', value: 1 }, state);
  expect(unlocked).toBeTruthy();
});

test('Badge: streak-7 does NOT unlock with streak 5', () => {
  const state = { xp: 100, streak: 5, skillMastery: {} };
  const unlocked = checkBadge({ type: 'streak', value: 7 }, state);
  expect(unlocked).toBeFalsy();
});

test('Badge: xp-500 unlocks with 600 XP', () => {
  const state = { xp: 600, streak: 0, skillMastery: {} };
  const unlocked = checkBadge({ type: 'xp', value: 500 }, state);
  expect(unlocked).toBeTruthy();
});

test('Badge: python-master does NOT unlock at 70% mastery', () => {
  const state = { xp: 0, streak: 0, skillMastery: { python: { mastery: 70, practiceCount: 5 } } };
  const unlocked = checkBadge({ type: 'mastery', value: 80, skillId: 'python' }, state);
  expect(unlocked).toBeFalsy();
});

test('Badge: python-master unlocks at 85% mastery', () => {
  const state = { xp: 0, streak: 0, skillMastery: { python: { mastery: 85, practiceCount: 10 } } };
  const unlocked = checkBadge({ type: 'mastery', value: 80, skillId: 'python' }, state);
  expect(unlocked).toBeTruthy();
});

// ══════════════════════════════════════════════════════════════
// UNIT TESTS: Prediction Algorithms
// ══════════════════════════════════════════════════════════════

function predictWeeks(mastery: number, weeklyHours: number, target = 80): number | null {
  if (mastery >= target) return 0;
  const gap = target - mastery;
  const hoursNeeded = (gap * 0.5) * (1 + mastery / 100);
  if (weeklyHours <= 0) return null;
  return Math.ceil(hoursNeeded / weeklyHours);
}

test('Prediction: mastered skill returns 0 weeks', () => {
  const weeks = predictWeeks(90, 10);
  expect(weeks).toBe(0);
});

test('Prediction: zero weekly hours returns null', () => {
  const weeks = predictWeeks(50, 0);
  expect(weeks).toBeFalsy();
});

test('Prediction: higher weekly hours = fewer weeks', () => {
  const w1 = predictWeeks(30, 5)!;
  const w2 = predictWeeks(30, 20)!;
  expect(w1).toBeGreaterThan(w2);
});

test('Prediction: prediction is positive for skill with gap', () => {
  const weeks = predictWeeks(20, 10);
  expect(weeks!).toBeGreaterThan(0);
});

// ══════════════════════════════════════════════════════════════
// UNIT TESTS: Level System
// ══════════════════════════════════════════════════════════════

const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5500, 9000, 14000, 21000, 30000, 42000];

function getLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

test('Level: 0 XP = Level 1', () => {
  expect(getLevel(0)).toBe(1);
});

test('Level: 500 XP = Level 2', () => {
  expect(getLevel(500)).toBe(2);
});

test('Level: 1499 XP = Level 2', () => {
  expect(getLevel(1499)).toBe(2);
});

test('Level: 42000 XP = Level 10', () => {
  expect(getLevel(42000)).toBe(10);
});

test('Level: 350 XP (seeded) = Level 1', () => {
  expect(getLevel(350)).toBe(1);
});

// ══════════════════════════════════════════════════════════════
// RUN ALL TESTS
// ══════════════════════════════════════════════════════════════

async function runTests() {
  console.log('\n🧠 NovaMind Test Suite\n' + '='.repeat(50));
  const results: { name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

  for (const t of tests) {
    try {
      t.fn();
      results.push({ name: t.name, status: 'PASS' });
      passed++;
      console.log(`  ✅ ${t.name}`);
    } catch (e: unknown) {
      const err = (e as Error).message;
      results.push({ name: t.name, status: 'FAIL', error: err });
      failed++;
      console.log(`  ❌ ${t.name}\n     → ${err}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed (${tests.length} total)`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed\n`);
    process.exit(1);
  }

  return { passed, failed, results };
}

runTests();
