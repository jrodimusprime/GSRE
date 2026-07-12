const QuizEngine = (() => {
  let allQuestions = [];
  let enabledModules = new Set();
  let eligibleQuestionIds = null;
  let currentQuestion = null;
  let shuffledOptions = [];
  let lastQuestionId = null;

  function init(questions, enabled, eligibleIds) {
    allQuestions = questions;
    enabledModules = new Set(enabled);
    eligibleQuestionIds = eligibleIds instanceof Set ? eligibleIds : new Set(eligibleIds || []);
    currentQuestion = null;
    lastQuestionId = null;
    shuffledOptions = [];
  }

  function setEnabledModules(enabled) {
    enabledModules = new Set(enabled);
  }

  function setEligibleQuestionIds(ids) {
    eligibleQuestionIds = ids instanceof Set ? ids : new Set(ids || []);
  }

  function activePool() {
    if (eligibleQuestionIds && eligibleQuestionIds.size) {
      return allQuestions.filter((q) => eligibleQuestionIds.has(q.id));
    }
    return allQuestions.filter((q) => enabledModules.has(q.module));
  }

  function unattemptedPool() {
    const answered = QuizStorage.getAnswers();
    return activePool().filter((q) => !answered[q.id]);
  }

  function remainingCount() {
    return unattemptedPool().length;
  }

  function activePoolTotal() {
    return activePool().length;
  }

  function shuffleOptions(q) {
    const opts = q.options.map((text, i) => ({ text, originalIndex: i }));
    return QuizLoader.shuffle(opts);
  }

  function pickRandom() {
    let candidates = unattemptedPool();
    if (!candidates.length) {
      currentQuestion = null;
      shuffledOptions = [];
      return null;
    }
    if (candidates.length > 1 && lastQuestionId) {
      const filtered = candidates.filter((q) => q.id !== lastQuestionId);
      if (filtered.length) candidates = filtered;
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
    setEligibleQuestionIds,
    activePool,
    unattemptedPool,
    remainingCount,
    activePoolTotal,
    pickRandom,
    current,
    currentShuffledOptions,
    submit,
  };
})();
