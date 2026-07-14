const QuizEngine = (() => {
  let allQuestions = [];
  let enabledModules = new Set();
  let eligibleQuestionIds = null;
  let requiredTags = null;
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

  function setRequiredTags(tags) {
    if (!tags || !tags.length) {
      requiredTags = null;
      return;
    }
    requiredTags = Array.isArray(tags) ? tags : [tags];
  }

  function activePool() {
    let pool;
    if (eligibleQuestionIds && eligibleQuestionIds.size) {
      pool = allQuestions.filter((q) => eligibleQuestionIds.has(q.id));
    } else {
      pool = allQuestions.filter((q) => enabledModules.has(q.module));
    }
    if (requiredTags && requiredTags.length) {
      pool = pool.filter((q) => {
        const qtags = q.tags || [];
        return requiredTags.every((tag) => qtags.includes(tag));
      });
    }
    return pool;
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
    const pool = unattemptedPool();
    if (!pool.length) {
      currentQuestion = null;
      shuffledOptions = [];
      return null;
    }

    const deferred = new Set(QuizStorage.getSkipped());
    const fresh = pool.filter((q) => !deferred.has(q.id));
    let candidates = fresh.length ? fresh : pool;

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

  function skipCurrent() {
    const q = currentQuestion;
    if (!q) return null;
    QuizStorage.addSkipped(q.id);
    lastQuestionId = q.id;
    currentQuestion = null;
    shuffledOptions = [];
    return q;
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
    setRequiredTags,
    activePool,
    unattemptedPool,
    remainingCount,
    activePoolTotal,
    pickRandom,
    skipCurrent,
    current,
    currentShuffledOptions,
    submit,
  };
})();
