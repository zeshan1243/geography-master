/**
 * game.js — the reusable quiz engine.
 *
 * One engine drives every game on the site. A game page only supplies markup
 * with the data-attributes below; the type, difficulty and question count come
 * from the element's dataset and from the URL:
 *
 *   startGame({ type: 'flags', difficulty: 'medium', questions: 10 })
 */

import {
  buildRound,
  buildPracticeRound,
  DIFFICULTIES,
  DEFAULT_QUESTIONS,
  difficulty as findDifficulty,
  makeRng,
  dailySeed,
  SURVIVAL_MAX
} from './quiz.js';
import { scoreAnswer, stars, verdict, survivalStars, survivalVerdict } from './score.js';
import {
  recordGame,
  bestScore,
  bestRun,
  todayKey,
  recordMiss,
  recordHit,
  missedItems,
  missedCount,
  clearMisses
} from './storage.js';
import { games, url, gameUrl, mapCoverage } from './data.js';
import { icon } from './icons.js';
import { shapeOf, fitShape, interactiveMap, zoomWindow } from './worldmap.js';

const ADVANCE_DELAY = { correct: 1300, wrong: 2300 };

/** Five stars, the first `count` of them filled. */
function starRow(count) {
  return Array.from({ length: 5 }, (_, i) => icon(i < count ? 'star' : 'starOutline')).join('');
}

/** The state object for the round in progress. */
function freshState(config, questions) {
  return {
    ...config,
    currentQuestion: 0,
    totalQuestions: questions.length,
    score: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    questions,
    answers: [],
    locked: false,
    askedAt: 0
  };
}

/* --- Rendering helpers --------------------------------------------------- */

/**
 * Renders the question's visual. Async because the map games have to fetch and
 * measure SVG geometry; everything else resolves immediately.
 *
 * @returns {Promise<SVGElement|null>} the map element, when there is one
 */
async function renderVisual(el, visual, onPick, showHint = true) {
  el.classList.remove('is-shape', 'is-map');

  if (!visual) {
    el.innerHTML = '';
    return null;
  }

  if (visual.kind === 'shape') {
    el.innerHTML = '';
    el.classList.add('is-shape');
    const svg = await shapeOf(visual.code, 'Outline of the country in question');
    if (!svg) {
      el.textContent = 'This outline could not be drawn.';
      return null;
    }
    el.appendChild(svg);
    fitShape(svg); // needs to be in the document before it can be measured
    return null;
  }

  if (visual.kind === 'map') {
    el.innerHTML = '';
    el.classList.add('is-map');
    const coverage = await mapCoverage();
    const names = new Map(coverage.countries.filter((c) => c.locate).map((c) => [c.code, c.name]));
    const { svg, map } = await interactiveMap({
      clickable: [...names.keys()],
      names,
      label: 'World map — click the country'
    });
    el.appendChild(svg);

    // Measured after insertion: the container's aspect comes from CSS and
    // differs between phone and desktop.
    const rect = svg.getBoundingClientRect();
    const aspect = rect.width && rect.height ? rect.width / rect.height : undefined;
    svg.setAttribute('viewBox', zoomWindow(visual.box, map, { aspect }));

    // Shown once. After the first question the prompt ("Find Syria on the
    // map") says everything the hint did, and on a short phone the extra line
    // is the only thing that falls below the fold.
    if (showHint) {
      const hint = document.createElement('p');
      hint.className = 'map-hint';
      hint.textContent = 'Tap the country on the map';
      el.appendChild(hint);
    }

    svg.addEventListener('click', (event) => {
      const path = event.target.closest('path.is-target');
      if (path) onPick(path.dataset.name, path.dataset.code);
    });
    return svg;
  }

  if (visual.kind === 'flag') {
    el.innerHTML = `<span class="flag-big" role="img" aria-label="Flag of the country in question">${visual.value}</span>`;
    return;
  }
  if (visual.kind === 'clues') {
    el.innerHTML = `<dl class="fact-grid">${visual.lines
      .map(([term, value]) => `<div class="fact"><dt>${term}</dt><dd>${value}</dd></div>`)
      .join('')}</dl>`;
    return;
  }
  el.innerHTML = `<div>
      ${visual.icon ? `<div class="subject-icon" aria-hidden="true">${visual.icon}</div>` : ''}
      <div class="subject">${visual.value}</div>
      ${visual.sub ? `<div class="subject-sub">${visual.sub}</div>` : ''}
    </div>`;
}

/** Per-question dots only work for a short round; longer ones use the bar. */
const DOTS_LIMIT = 12;

function renderDots(el, state) {
  if (state.survival || state.totalQuestions > DOTS_LIMIT) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.innerHTML = state.questions
    .map((_, i) => {
      const answer = state.answers[i];
      const status = answer ? (answer.correct ? 'correct' : 'wrong') : 'pending';
      return `<span data-state="${status}"></span>`;
    })
    .join('');
}

/* --- Engine -------------------------------------------------------------- */

export async function startGame(config) {
  const root = config.root;
  const el = (name) => root.querySelector(`[data-${name}]`);
  const screens = {
    setup: root.querySelector('[data-screen="setup"]'),
    play: root.querySelector('[data-screen="play"]'),
    results: root.querySelector('[data-screen="results"]')
  };

  const show = (name) => {
    Object.entries(screens).forEach(([key, node]) => {
      if (node) node.hidden = key !== name;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Replaying rebuilds the round; drop the previous round's listeners first.
  if (root._wggCleanup) root._wggCleanup();

  const status = el('status');
  if (status) {
    status.hidden = false;
    status.textContent = 'Building your round…';
  }

  const rules = findDifficulty(config.difficulty);
  const survival = Boolean(rules.survival) && !config.daily;

  const isPractice = config.type === 'practice';

  let questions;
  try {
    questions = isPractice
      ? await buildPracticeRound({ items: missedItems(), count: config.questions })
      : await buildRound({
          type: config.type,
          difficulty: config.difficulty,
          // Survival has no set length: take the whole pool and let the first
          // wrong answer end it.
          count: survival ? SURVIVAL_MAX : config.questions,
          rng: config.seed ? makeRng(config.seed) : Math.random
        });
  } catch (error) {
    if (status) {
      status.hidden = false;
      status.innerHTML =
        '<p><strong>The question data could not be loaded.</strong></p>' +
        '<p class="muted">If you opened this file directly, run the site through a local web server.</p>';
    }
    return null;
  }
  if (status) status.hidden = true;

  const state = freshState(config, questions);
  state.survival = survival;
  show('play');

  // A survival run has no known length, so there is nothing to fill a bar with.
  const progressTrack = root.querySelector('.progress-track');
  if (progressTrack) progressTrack.hidden = survival;

  const answersBox = el('answers');
  const feedback = el('feedback');

  function paintScore() {
    const scoreEl = el('score');
    const streakEl = el('streak');
    if (scoreEl) scoreEl.textContent = state.score;
    if (streakEl) streakEl.textContent = state.streak;
  }

  /** The map element for the current question, when the game uses one. */
  let mapEl = null;

  async function askQuestion() {
    const question = state.questions[state.currentQuestion];
    const counter = el('counter');
    if (counter) {
      counter.textContent = state.survival
        ? `Question ${state.currentQuestion + 1} · sudden death`
        : `Question ${state.currentQuestion + 1}/${state.totalQuestions}`;
    }

    const progress = el('progress');
    if (progress && !state.survival) {
      progress.style.width = `${(state.currentQuestion / state.totalQuestions) * 100}%`;
    }

    // Locked while the visual is prepared, so a stray click cannot answer a
    // question that is not on screen yet.
    state.locked = true;
    mapEl = await renderVisual(
      el('visual'),
      question.visual,
      (name) => submit(name),
      state.currentQuestion === 0
    );

    const prompt = el('prompt');
    if (prompt) prompt.textContent = question.prompt;

    answersBox.hidden = question.interaction === 'map';
    // Some games answer with a glyph rather than a phrase (the flag picker).
    if (question.optionStyle) answersBox.dataset.optionStyle = question.optionStyle;
    else answersBox.removeAttribute('data-option-style');
    // The map fills the width on its own; everything else pairs a visual with
    // a column of answers, which is what the split layout is for.
    root.dataset.layout = question.interaction === 'map' ? 'wide' : 'split';
    answersBox.innerHTML = question.options
      .map(
        (option, i) =>
          `<button class="answer" type="button" data-option="${i}">
             <span>${option}</span><span class="marker" aria-hidden="true"></span>
           </button>`
      )
      .join('');
    answersBox.classList.add('animate-in');
    setTimeout(() => answersBox.classList.remove('animate-in'), 300);

    if (feedback) {
      // Keeps its space; only the contents fade out. Removing it from the
      // flow is what made the screen jump between questions.
      feedback.removeAttribute('data-kind');
      feedback.innerHTML = '';
    }

    renderDots(el('dots'), state);
    paintScore();

    state.locked = false;
    state.askedAt = performance.now();
  }

  /**
   * Records an answer. `chosen` is the country/option name, whichever surface
   * it came from — an option button or a click on the map.
   */
  function submit(chosen) {
    if (state.locked) return;
    state.locked = true;

    const question = state.questions[state.currentQuestion];
    const isCorrect = chosen === question.answer;
    const elapsedMs = performance.now() - state.askedAt;

    state.streak = isCorrect ? state.streak + 1 : 0;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    if (isCorrect) state.correct += 1;

    // Remembered so the fact can be re-tested later. A correct answer only
    // counts against an item that was previously missed, so ordinary rounds
    // add nothing.
    if (question.subject) {
      if (isCorrect) recordHit(question.kind, question.subject);
      else recordMiss(question.kind, question.subject);
    }

    const { points, parts } = scoreAnswer({ correct: isCorrect, elapsedMs, streak: state.streak });
    state.score += points;
    state.answers.push({ question, chosen, correct: isCorrect, points });

    // On the map, mark the country they clicked and the one they should have.
    if (mapEl) {
      const correctPath = mapEl.querySelector(`#map-${question.answerCode}`);
      if (correctPath) correctPath.dataset.result = 'correct';
      if (!isCorrect) {
        const picked = [...mapEl.querySelectorAll('path.is-target')].find(
          (p) => p.dataset.name === chosen
        );
        if (picked) picked.dataset.result = 'wrong';
      }
      mapEl.classList.add('is-answered');
    }

    answersBox.querySelectorAll('.answer').forEach((btn) => {
      const value = btn.querySelector('span').textContent;
      btn.disabled = true;
      if (value === question.answer) {
        btn.dataset.result = 'correct';
        btn.querySelector('.marker').innerHTML = icon('check');
      } else if (value === chosen) {
        btn.dataset.result = 'wrong';
        btn.querySelector('.marker').innerHTML = icon('cross');
      } else {
        btn.dataset.result = 'muted';
      }
    });

    if (feedback) {
      const streakLine = parts.find((p) => p.label.includes('streak'));
      // One fixed-shape strip in both states — a headline row plus a clamped
      // explanation — so revealing it never changes the layout's height.
      feedback.innerHTML = `<div class="feedback-head">
          ${icon(isCorrect ? 'checkCircle' : 'crossCircle')}
          <strong>${isCorrect ? 'Correct' : 'Not quite'}</strong>
          ${
            isCorrect
              ? `<span class="points">+${points}</span>`
              : `<span class="answer-was">${question.answer}</span>`
          }
          ${streakLine ? `<span class="streak-flash">${streakLine.label}</span>` : ''}
        </div>
        <p class="note">${question.explanation}</p>`;
      feedback.dataset.kind = isCorrect ? 'correct' : 'wrong';
    }

    paintScore();
    renderDots(el('dots'), state);

    // Sudden death: the run stops here, but the correct answer is still shown
    // for the usual beat before the results appear.
    if (state.survival && !isCorrect) {
      setTimeout(finish, ADVANCE_DELAY.wrong);
      return;
    }

    setTimeout(next, isCorrect ? ADVANCE_DELAY.correct : ADVANCE_DELAY.wrong);
  }

  function next() {
    state.currentQuestion += 1;
    if (state.currentQuestion >= state.totalQuestions) finish();
    else askQuestion();
  }

  function finish() {
    const progress = el('progress');
    if (progress) progress.style.width = '100%';

    // In survival the round length is however far they got, not the pool size.
    const asked = state.answers.length;
    const cleared = state.survival && state.correct === state.totalQuestions;

    const { isBest, best, streakDays } = recordGame({
      type: state.type,
      difficulty: state.difficulty,
      score: state.score,
      correct: state.correct,
      total: state.survival ? asked : state.totalQuestions,
      bestStreak: state.bestStreak,
      daily: Boolean(state.daily),
      survivalRun: state.survival ? state.correct : undefined
    });

    const set = (name, value) => {
      const node = el(name);
      if (node) node.textContent = value;
    };

    const title = el('result-title');
    const titleIcon = el('result-icon');
    const setIcon = (name) => {
      if (titleIcon) titleIcon.innerHTML = icon(name);
    };

    if (state.survival) {
      if (title) title.textContent = cleared ? 'Pool cleared!' : 'Run over';
      setIcon(cleared ? 'trophy' : 'crossCircle');
      set('result-score', state.score);
      const starsEl = el('result-stars');
      if (starsEl) starsEl.innerHTML = starRow(survivalStars(state.correct));
      set(
        'result-summary',
        `You survived ${state.correct} ${state.correct === 1 ? 'question' : 'questions'}`
      );
      set('result-verdict', survivalVerdict(state.correct, cleared));
      set(
        'result-best',
        `Longest run on this game: ${bestRun(state.type)} · Personal best score on Expert: ${best} · ${streakDays} day streak`
      );
    } else {
      if (title) title.textContent = 'Game complete!';
      setIcon('flag');
      set('result-score', state.score);
      const starsEl = el('result-stars');
      if (starsEl) starsEl.innerHTML = starRow(stars(state.correct, state.totalQuestions));
      set('result-summary', `${state.correct} / ${state.totalQuestions} correct`);
      set('result-verdict', verdict(state.correct, state.totalQuestions));
      set(
        'result-best',
        `Best streak: ${state.bestStreak} · Personal best on ${findDifficulty(state.difficulty).label}: ${best} · ${streakDays} day streak`
      );
    }

    const newBest = el('result-new-best');
    if (newBest) newBest.hidden = !isBest;

    // Offered only when there is something waiting, and never on the review
    // page itself.
    const reviewLink = el('review-link');
    if (reviewLink) reviewLink.hidden = state.type === 'practice' || missedCount() === 0;

    const review = el('result-review');
    if (review) {
      review.innerHTML = state.answers
        .map(
          (a) => `<li>
            <span class="mark" data-ok="${a.correct}">${a.correct ? icon('check') : icon('cross')}</span>
            <span><span class="q">${a.question.prompt}</span><br><strong>${a.question.answer}</strong></span>
          </li>`
        )
        .join('');
    }

    show('results');
  }

  const clickHandler = (event) => {
    const btn = event.target.closest('.answer');
    if (btn && !btn.disabled) submit(btn.querySelector('span').textContent);
  };
  answersBox.addEventListener('click', clickHandler);

  // Number keys 1-4 as a shortcut for the answers (button games only; the map
  // quiz has no numbered options).
  const keyHandler = (event) => {
    if (screens.play.hidden || answersBox.hidden) return;
    const index = Number(event.key) - 1;
    if (index >= 0 && index < 4) {
      const btn = answersBox.querySelector(`[data-option="${index}"]`);
      if (btn && !btn.disabled) submit(btn.querySelector('span').textContent);
    }
  };
  document.addEventListener('keydown', keyHandler);

  root._wggCleanup = () => {
    answersBox.removeEventListener('click', clickHandler);
    document.removeEventListener('keydown', keyHandler);
    root._wggCleanup = null;
  };

  askQuestion();
  return state;
}

/* --- Page wiring --------------------------------------------------------- */

function difficultyMarkup(selected) {
  return DIFFICULTIES.map(
    (d) => `<button class="difficulty" type="button" data-difficulty="${d.id}"
              aria-pressed="${d.id === selected}">
        <span class="difficulty-dot" data-level="${d.id}">${icon('dot')}</span>
        <span><strong>${d.label}</strong><small>${d.blurb}</small></span>
      </button>`
  ).join('');
}

async function renderRelated(root, currentId) {
  const box = root.querySelector('[data-related]');
  if (!box) return;
  const list = await games();
  const others = list.filter((g) => g.id !== currentId).sort(() => Math.random() - 0.5).slice(0, 3);
  box.innerHTML = others
    .map(
      (g) => `<a href="${gameUrl(g)}">
        <span aria-hidden="true">${g.icon}</span> ${g.name}
      </a>`
    )
    .join('');
}

/** Boots the game page: difficulty picker, start button, result actions. */
export async function initGamePage() {
  const root = document.querySelector('[data-game]');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const type = root.dataset.gameId;
  const questionCount = Number(root.dataset.questions) || DEFAULT_QUESTIONS;
  const isDaily = params.get('daily') === '1';

  let selected = params.get('difficulty');
  if (!DIFFICULTIES.some((d) => d.id === selected)) selected = 'medium';

  const list = root.querySelector('[data-difficulty-list]');
  const bestLine = root.querySelector('[data-best]');
  const practice = type === 'practice';

  /**
   * The practice screen has no difficulty to choose. What it shows instead is
   * how much is waiting, and it refuses to start with an empty list.
   */
  const paintPractice = () => {
    const due = missedCount();
    const countEl = root.querySelector('[data-review-count]');
    const emptyEl = root.querySelector('[data-review-empty]');
    const startBtn = root.querySelector('[data-start]');

    if (countEl) {
      countEl.textContent = due
        ? `${due} question${due === 1 ? '' : 's'} waiting to be reviewed`
        : 'Nothing to review yet';
    }
    if (emptyEl) emptyEl.hidden = due > 0;
    if (startBtn) {
      startBtn.disabled = due === 0;
      startBtn.textContent = due ? 'Start review' : 'Nothing to review';
    }
  };

  const paintBest = () => {
    if (practice) {
      paintPractice();
      return;
    }
    if (!bestLine) return;
    const best = bestScore(type, selected);
    bestLine.textContent = best
      ? `Your best on ${findDifficulty(selected).label}: ${best} points`
      : 'No score yet on this difficulty — set one now.';
  };

  if (list) {
    list.innerHTML = difficultyMarkup(selected);
    list.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-difficulty]');
      if (!btn) return;
      selected = btn.dataset.difficulty;
      list.querySelectorAll('[data-difficulty]').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      paintBest();
    });
  }
  paintBest();

  const launch = () =>
    startGame({
      root,
      type,
      difficulty: selected,
      questions: questionCount,
      daily: isDaily,
      seed: isDaily ? dailySeed(todayKey()) : null
    });

  root.querySelector('[data-start]')?.addEventListener('click', launch);
  root.querySelector('[data-play-again]')?.addEventListener('click', () => {
    // After a review round the list has shrunk; re-check before restarting.
    if (practice && missedCount() === 0) {
      paintPractice();
      root.querySelector('[data-screen="setup"]').hidden = false;
      root.querySelector('[data-screen="results"]').hidden = true;
      return;
    }
    launch();
  });

  root.querySelector('[data-clear-review]')?.addEventListener('click', () => {
    if (window.confirm('Clear your review list? This cannot be undone.')) {
      clearMisses();
      paintPractice();
    }
  });

  const another = root.querySelector('[data-another-game]');
  if (another && !practice) {
    const all = await games();
    const pick = all.filter((g) => g.id !== type)[Math.floor(Math.random() * (all.length - 1))];
    if (pick) another.href = `${gameUrl(pick)}?difficulty=${selected}`;
  }

  renderRelated(root, type);

  if (params.get('autostart') === '1' || isDaily) launch();
}
