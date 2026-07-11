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

  function recordAnswer(questionId, correct, moduleId) {
    const data = load();
    data.answers = data.answers || {};
    data.answers[questionId] = { correct, module: moduleId, at: Date.now() };
    if (!correct) {
      data.wrongBook = data.wrongBook || [];
      if (!data.wrongBook.includes(questionId)) data.wrongBook.push(questionId);
    }
    data.moduleStats = data.moduleStats || {};
    const ms = data.moduleStats[moduleId] || { correct: 0, total: 0 };
    ms.total++;
    if (correct) ms.correct++;
    data.moduleStats[moduleId] = ms;
    save(data);
  }

  function getOverallStats() {
    const stats = load().moduleStats || {};
    let correct = 0;
    let total = 0;
    for (const m of Object.values(stats)) {
      correct += m.correct || 0;
      total += m.total || 0;
    }
    return {
      correct,
      total,
      pct: total ? Math.round((correct / total) * 100) : null,
    };
  }

  function getModuleStats() {
    return load().moduleStats || {};
  }

  function getEnabledModules(allModuleIds) {
    const saved = load().enabledModules;
    if (!Array.isArray(saved) || !saved.length) return new Set(allModuleIds);
    const valid = saved.filter((id) => allModuleIds.includes(id));
    return valid.length ? new Set(valid) : new Set(allModuleIds);
  }

  function setEnabledModules(moduleIds) {
    const data = load();
    data.enabledModules = [...moduleIds];
    save(data);
  }

  function getWrongBook() {
    return load().wrongBook || [];
  }

  function clearProgress() {
    localStorage.removeItem(KEY);
  }

  return {
    recordAnswer,
    getOverallStats,
    getModuleStats,
    getEnabledModules,
    setEnabledModules,
    getWrongBook,
    clearProgress,
    load,
  };
})();
