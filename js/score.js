/**
 * score.js — scoring rules, kept in one place so they are easy to retune.
 */

export const RULES = {
  correct: 100,
  fastBonus: 50,
  fastWithinMs: 5000,
  streakBonuses: { 3: 50, 5: 100, 10: 250 },
  longStreakBonus: 250,   // repeated every 5 answers past 10
  longStreakEvery: 5
};

function streakBonus(streak) {
  if (RULES.streakBonuses[streak]) return RULES.streakBonuses[streak];
  if (streak > 10 && streak % RULES.longStreakEvery === 0) return RULES.longStreakBonus;
  return 0;
}

/**
 * @param {{correct: boolean, elapsedMs: number, streak: number}} answer
 *        `streak` is the streak *after* this answer.
 * @returns {{points: number, parts: Array<{label: string, points: number}>}}
 */
export function scoreAnswer({ correct, elapsedMs, streak }) {
  if (!correct) return { points: 0, parts: [] };

  const parts = [{ label: 'Correct', points: RULES.correct }];

  if (elapsedMs <= RULES.fastWithinMs) {
    parts.push({ label: 'Fast answer', points: RULES.fastBonus });
  }

  const bonus = streakBonus(streak);
  if (bonus) parts.push({ label: `${streak} answer streak`, points: bonus });

  return { points: parts.reduce((sum, p) => sum + p.points, 0), parts };
}

/** 0–5 stars from the share of correct answers. */
export function stars(correct, total) {
  if (!total) return 0;
  const pct = (correct / total) * 100;
  if (pct >= 100) return 5;
  if (pct >= 80) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  if (pct >= 20) return 1;
  return 0;
}

export function starString(count) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

/** A short line of encouragement matched to the result. */
export function verdict(correct, total) {
  const pct = total ? (correct / total) * 100 : 0;
  if (pct === 100) return 'Perfect round — you know the world.';
  if (pct >= 80) return 'Excellent geography knowledge.';
  if (pct >= 60) return 'Solid round. A few more and you will have these down.';
  if (pct >= 40) return 'Getting there — try the same difficulty again.';
  return 'Everyone starts somewhere. Try an easier difficulty.';
}
