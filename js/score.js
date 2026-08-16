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

/**
 * Survival stars come from run length. Accuracy would be meaningless here:
 * a run always ends on the one wrong answer, so accuracy is near-100% whether
 * you lasted three questions or thirty.
 */
export function survivalStars(runLength) {
  if (runLength >= 30) return 5;
  if (runLength >= 20) return 4;
  if (runLength >= 10) return 3;
  if (runLength >= 5) return 2;
  if (runLength >= 1) return 1;
  return 0;
}

export function survivalVerdict(runLength, cleared) {
  if (cleared) return 'You cleared the entire pool without a single mistake.';
  if (runLength === 0) return 'Out on the first question. Expert is unforgiving.';
  if (runLength < 5) return 'A short run. Try Hard difficulty to warm up first.';
  if (runLength < 10) return 'Respectable. Ten in a row is the next target.';
  if (runLength < 20) return 'Strong run — you know the obscure ones.';
  if (runLength < 30) return 'Excellent. Very few people get this far on expert.';
  return 'Exceptional. That is expert-level geography.';
}

/**
 * The free-recall "Name the Countries" game has no accuracy — everything
 * typed is either right or ignored — so it needs its own scale, calibrated
 * against how many countries people actually name in fifteen minutes rather
 * than a raw percentage of 195.
 */
export function recallStars(count) {
  if (count >= 150) return 5;
  if (count >= 100) return 4;
  if (count >= 60) return 3;
  if (count >= 30) return 2;
  if (count >= 10) return 1;
  return 0;
}

export function recallVerdict(count) {
  if (count >= 150) return 'Exceptional. That is elite-level geography knowledge.';
  if (count >= 100) return 'Excellent — most people never get past sixty.';
  if (count >= 60) return 'Strong. You know most of the world.';
  if (count >= 30) return 'Solid — above the average of around thirty.';
  if (count >= 10) return 'A reasonable start. Play again and see how many more come back to you.';
  return 'Everyone starts somewhere. The list of what you missed is the fastest way to improve.';
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
