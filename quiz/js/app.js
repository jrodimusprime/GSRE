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
    return QuizStorage.getEnabledPoolProgress(questionIdsByModule, enabledModules);
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

  function onNext() {
    el('next-btn').classList.add('hidden');
    refreshUI();
    showNextQuestion();
    QuizUI.scrollToQuizTop();
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
      pool.remaining
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
