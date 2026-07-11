const QuizApp = (() => {
  let config = null;
  let enabledModules = new Set();
  let moduleById = {};

  async function init() {
    config = await QuizLoader.loadSections();
    moduleById = Object.fromEntries(config.modules.map((m) => [m.id, m]));
    const allIds = config.modules.map((m) => m.id);
    enabledModules = QuizStorage.getEnabledModules(allIds);

    const questions = await QuizLoader.getAllQuestions();
    QuizEngine.init(questions, enabledModules);

    QuizUI.refresh(config.modules, enabledModules);
    bindEvents();
    showNextQuestion();
  }

  function bindEvents() {
    el('options').addEventListener('click', onOptionClick);
    el('next-btn').addEventListener('click', onNext);
    el('module-chips').addEventListener('change', onModuleToggle);
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
    QuizUI.refresh(config.modules, enabledModules);
    el('next-btn').classList.remove('hidden');
  }

  function onNext() {
    el('next-btn').classList.add('hidden');
    showNextQuestion();
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
    QuizUI.refresh(config.modules, enabledModules);
    showNextQuestion();
  }

  function showNextQuestion() {
    const q = QuizEngine.pickRandom();
    if (!q) {
      QuizUI.showEmptyPool();
      return;
    }
    const mod = moduleById[q.module];
    QuizUI.renderQuestion(q, QuizEngine.currentShuffledOptions(), mod?.title || q.module);
  }

  document.addEventListener('DOMContentLoaded', init);
  return { init };
})();
