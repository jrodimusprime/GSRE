const QuizEngine = (() => {
  let allQuestions = [];
  let enabledModules = new Set();
  let currentQuestion = null;
  let shuffledOptions = [];
  let lastQuestionId = null;

  function init(questions, enabled) {
    allQuestions = questions;
    enabledModules = new Set(enabled);
    currentQuestion = null;
    lastQuestionId = null;
    shuffledOptions = [];
  }

  function setEnabledModules(enabled) {
    enabledModules = new Set(enabled);
  }

  function activePool() {
    return allQuestions.filter((q) => enabledModules.has(q.module));
  }

  function shuffleOptions(q) {
    const opts = q.options.map((text, i) => ({ text, originalIndex: i }));
    return QuizLoader.shuffle(opts);
  }

  function pickRandom() {
    const pool = activePool();
    if (!pool.length) {
      currentQuestion = null;
      shuffledOptions = [];
      return null;
    }
    let candidates = pool;
    if (pool.length > 1 && lastQuestionId) {
      candidates = pool.filter((q) => q.id !== lastQuestionId);
    }
    const idx = Math.floor(Math.random() * candidates.length);
    currentQuestion = candidates[idx];
    lastQuestionId = currentQuestion.id;
    shuffledOptions = shuffleOptions(currentQuestion);
    return currentQuestion;
  }

  function current() {
    return currentQuestion;
  }

  function currentShuffledOptions() {
    return shuffledOptions;
  }

  function submit(selectedOriginalIndex) {
    const q = currentQuestion;
    if (!q) return null;
    const correct = selectedOriginalIndex === q.correctIndex;
    QuizStorage.recordAnswer(q.id, correct, q.module);
    return { correct, explanation: q.explanation, question: q };
  }

  return {
    init,
    setEnabledModules,
    activePool,
    pickRandom,
    current,
    currentShuffledOptions,
    submit,
  };
})();
