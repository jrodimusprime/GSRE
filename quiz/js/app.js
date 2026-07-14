const QuizApp = (() => {
  let config = null;
  let enabledModules = new Set();
  let moduleById = {};
  let questionIdsByModule = {};

  async function loadQuestionIdsByModule(modules) {
    const map = {};
    for (const m of modules) {
      const qs = await QuizLoader.getModuleQuestions(m.id);
      map[m.id] = qs.map((q) => q.id);
    }
    return map;
  }

  function buildEligibleQuestionIds() {
    const ids = new Set();
    for (const modId of enabledModules) {
      for (const id of questionIdsByModule[modId] || []) {
        ids.add(id);
      }
    }
    return ids;
  }

  function syncEnginePool() {
    QuizEngine.setEligibleQuestionIds(buildEligibleQuestionIds());
  }

  function moduleProgress() {
    return QuizStorage.getAttemptedProgress(questionIdsByModule);
  }

  function poolProgress() {
    const pool = QuizEngine.activePool();
    const answers = QuizStorage.getAnswers();
    let attempted = 0;
    let correct = 0;
    for (const q of pool) {
      const rec = answers[q.id];
      if (!rec) continue;
      attempted++;
      if (rec.correct) correct++;
    }
    const total = pool.length;
    const remaining = Math.max(0, total - attempted);
    return {
      total,
      attempted,
      remaining,
      correct,
      pct: attempted ? Math.round((correct / attempted) * 100) : null,
      exploredPct: total ? Math.round((attempted / total) * 100) : 0,
    };
  }

  function applyUrlFilters() {
    const loc = (typeof window !== 'undefined' && window.location) || globalThis.location;
    let tag = null;
    if (typeof URLSearchParams !== 'undefined' && loc && loc.search) {
      tag = new URLSearchParams(loc.search).get('tag');
    } else if (loc && loc.search) {
      const match = loc.search.match(/[?&]tag=([^&]+)/);
      tag = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
    }
    if (!tag) return;
    QuizEngine.setRequiredTags(
      tag
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    );
  }

  async function init() {
    config = await QuizLoader.loadSections();
    if (!config || !Array.isArray(config.modules) || !config.modules.length) {
      throw new Error('sections.json is missing modules');
    }
    moduleById = Object.fromEntries(config.modules.map((m) => [m.id, m]));
    const allIds = config.modules.map((m) => m.id);
    enabledModules = QuizStorage.getEnabledModules(allIds);

    const questions = await QuizLoader.getAllQuestions();
    if (!questions.length) {
      throw new Error('No questions loaded');
    }
    questionIdsByModule = await loadQuestionIdsByModule(config.modules);
    QuizEngine.init(questions, enabledModules, buildEligibleQuestionIds());
    applyUrlFilters();

    refreshUI();
    bindEvents();
    showNextQuestion();
  }

  function refreshUI() {
    QuizUI.refresh(config.modules, enabledModules, moduleProgress(), poolProgress());
  }

  function bindEvents() {
    el('options').addEventListener('click', onOptionClick);
    el('next-btn').addEventListener('click', onNext);
    el('skip-btn').addEventListener('click', onSkip);
    el('module-chips').addEventListener('change', onModuleToggle);
    el('reset-progress-btn').addEventListener('click', onResetProgress);
  }

  function el(id) {
    return document.getElementById(id);
  }

  function onOptionClick(e) {
    const btn = e.target.closest('.option-btn');
    if (!btn || btn.disabled) return;
    const idx = parseInt(btn.dataset.idx, 10);
    const result = QuizEngine.submit(idx);
    if (!result) return;
    QuizUI.showFeedback(result.correct, result.explanation);
    refreshUI();
    el('next-btn').classList.remove('hidden');
  }

  function scrollPageToTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function onNext() {
    el('next-btn').classList.add('hidden');
    showNextQuestion();
    scrollPageToTop();
    requestAnimationFrame(scrollPageToTop);
    window.setTimeout(scrollPageToTop, 0);
  }

  function onSkip() {
    if (!QuizEngine.current()) return;
    QuizEngine.skipCurrent();
    showNextQuestion();
    scrollPageToTop();
    requestAnimationFrame(scrollPageToTop);
    window.setTimeout(scrollPageToTop, 0);
  }

  function onModuleToggle(e) {
    const input = e.target.closest('input[data-module]');
    if (!input) return;
    if (input.checked) {
      enabledModules.add(input.dataset.module);
    } else {
      enabledModules.delete(input.dataset.module);
    }
    QuizStorage.setEnabledModules([...enabledModules]);
    QuizEngine.setEnabledModules(enabledModules);
    syncEnginePool();
    refreshUI();
    showNextQuestion();
  }

  function onResetProgress() {
    if (!window.confirm('Clear all quiz progress and show every question again?')) return;
    QuizStorage.clearProgress();
    enabledModules = QuizStorage.getEnabledModules(config.modules.map((m) => m.id));
    syncEnginePool();
    refreshUI();
    showNextQuestion();
  }

  function showNextQuestion() {
    const pool = poolProgress();
    if (!pool.total) {
      QuizUI.showEmptyPool();
      return;
    }
    const q = QuizEngine.pickRandom();
    if (!q) {
      QuizUI.showPoolExhausted(pool);
      return;
    }
    const mod = moduleById[q.module];
    QuizUI.renderQuestion(
      q,
      QuizEngine.currentShuffledOptions(),
      (mod && mod.title) || q.module,
      QuizEngine.remainingCount()
    );
  }

  async function boot() {
    try {
      await init();
    } catch (err) {
      console.error('Quiz init failed:', err);
      QuizUI.showInitError(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  return { init, boot };
})();
