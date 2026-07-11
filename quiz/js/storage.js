const QuizStorage = (() => {
  const KEY = 'gsre-quiz-v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function recordAnswer(questionId, correct) {
    const data = load();
    data.answers = data.answers || {};
    data.answers[questionId] = { correct, at: Date.now() };
    if (!correct) {
      data.wrongBook = data.wrongBook || [];
      if (!data.wrongBook.includes(questionId)) data.wrongBook.push(questionId);
    }
    save(data);
  }

  function getProgress(moduleId, total) {
    const data = load();
    const answered = Object.keys(data.answers || {}).length;
    return { answered, total, pct: total ? Math.round((answered / total) * 100) : 0 };
  }

  function getWrongBook() {
    return load().wrongBook || [];
  }

  function clearProgress() {
    localStorage.removeItem(KEY);
  }

  return { recordAnswer, getProgress, getWrongBook, clearProgress, load };
})();
