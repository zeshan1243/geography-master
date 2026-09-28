/**
 * achievements.js — badges computed entirely from the existing local
 * profile (js/storage.js). No new tracking, no server, no accounts: every
 * threshold here reads a field storage.js already records for the stats
 * block and the streak calendar.
 */

import { countStreak, accuracy } from './storage.js';

/**
 * @param {object} profile the object returned by storage.js's load()
 * @returns {Array<{id: string, name: string, description: string, icon: string, unlocked: boolean}>}
 */
export function computeAchievements(profile) {
  const streakDays = countStreak(profile.playedDays);
  const variety = Object.keys(profile.gameCounts || {}).length;
  const acc = accuracy(profile);
  const bestStreak = profile.bestStreak || 0;

  return [
    { id: 'first-game', name: 'Getting Started', description: 'Play your first game', icon: '🌱', unlocked: profile.gamesPlayed >= 1 },
    { id: 'games-10', name: 'Warming Up', description: 'Play 10 games', icon: '🔥', unlocked: profile.gamesPlayed >= 10 },
    { id: 'games-50', name: 'Regular Player', description: 'Play 50 games', icon: '⭐', unlocked: profile.gamesPlayed >= 50 },
    { id: 'games-100', name: 'Dedicated', description: 'Play 100 games', icon: '🏅', unlocked: profile.gamesPlayed >= 100 },
    { id: 'games-250', name: 'Geography Obsessed', description: 'Play 250 games', icon: '🏆', unlocked: profile.gamesPlayed >= 250 },

    { id: 'questions-100', name: '100 Questions', description: 'Answer 100 questions', icon: '💯', unlocked: profile.totalQuestions >= 100 },
    { id: 'questions-500', name: '500 Questions', description: 'Answer 500 questions', icon: '📚', unlocked: profile.totalQuestions >= 500 },
    { id: 'questions-1000', name: '1,000 Questions', description: 'Answer 1,000 questions', icon: '🎓', unlocked: profile.totalQuestions >= 1000 },

    { id: 'streak-3', name: '3 Day Streak', description: 'Play 3 days in a row', icon: '📅', unlocked: streakDays >= 3 },
    { id: 'streak-7', name: '7 Day Streak', description: 'Play 7 days in a row', icon: '🔥', unlocked: streakDays >= 7 },
    { id: 'streak-14', name: '14 Day Streak', description: 'Play 14 days in a row', icon: '🔥', unlocked: streakDays >= 14 },
    { id: 'streak-30', name: '30 Day Streak', description: 'Play 30 days in a row', icon: '💪', unlocked: streakDays >= 30 },
    { id: 'streak-60', name: '60 Day Streak', description: 'Play 60 days in a row', icon: '🌟', unlocked: streakDays >= 60 },
    { id: 'streak-100', name: '100 Day Streak', description: 'Play 100 days in a row', icon: '💎', unlocked: streakDays >= 100 },

    { id: 'combo-5', name: 'Getting Warmed Up', description: 'Get a 5-answer streak in one round', icon: '✨', unlocked: bestStreak >= 5 },
    { id: 'combo-10', name: 'On a Roll', description: 'Get a 10-answer streak in one round', icon: '⚡', unlocked: bestStreak >= 10 },
    { id: 'combo-25', name: 'Unstoppable', description: 'Get a 25-answer streak in one round', icon: '🚀', unlocked: bestStreak >= 25 },

    { id: 'explorer-5', name: 'World Explorer', description: 'Play 5 different games', icon: '🧭', unlocked: variety >= 5 },
    { id: 'explorer-10', name: 'Well Travelled', description: 'Play 10 different games', icon: '🗺️', unlocked: variety >= 10 },

    { id: 'sharp-shooter', name: 'Sharp Shooter', description: 'Keep 80%+ accuracy over 50+ questions', icon: '🎯', unlocked: profile.totalQuestions >= 50 && acc >= 80 }
  ];
}
