const QuizEngine = (() => {
  let questions = [];
  let index = 0;
  let score = 0;
  let mode = 'study';
  let examEndTime = null;
  let shuffledOptions = [];

  function init(qs, opts = {}) {
    questions = QuizLoader.shuffle([...qs]);
    index = 0;
    score = 0;
    mode = opts.mode || 'study';
    examEndTime = opts.minutes
      ? Date.now() + opts.minutes * 60 * 1000
      : null;
    prepareOptions();
  }

  function prepareOptions() {
    shuffledOptions = questions.map((q) => {
      const opts = q.options.map((text, i) => ({ text, originalIndex: i }));
      return QuizLoader.shuffle(opts);
    });
  }

  function current() {
    return questions[index] || null;
  }

  function currentShuffledOptions() {
    return shuffledOptions[index] || [];
  }

  function total() {
    return questions.length;
  }

  function progress() {
    return { index, total: questions.length, score, mode };
  }

  function submit(selectedOriginalIndex) {
    const q = current();
    if (!q) return null;
    const correct = selectedOriginalIndex === q.correctIndex;
    if (correct) score++;
    if (mode === 'study') QuizStorage.recordAnswer(q.id, correct);
    const result = { correct, explanation: q.explanation, question: q };
    index++;
    return result;
  }

  function examSubmit(selectedOriginalIndex) {
    const q = current();
    if (!q) return null;
    const correct = selectedOriginalIndex === q.correctIndex;
    if (correct) score++;
    const result = { correct, question: q };
    index++;
    return result;
  }

  function isDone() {
    return index >= questions.length;
  }

  function timeRemaining() {
    if (!examEndTime) return null;
    return Math.max(0, examEndTime - Date.now());
  }

  function results() {
    return {
      score,
      total: questions.length,
      pct: questions.length
        ? Math.round((score / questions.length) * 100)
        : 0,
      questions,
    };
  }

  return {
    init,
    current,
    currentShuffledOptions,
    total,
    progress,
    submit,
    examSubmit,
    isDone,
    timeRemaining,
    results,
  };
})();
