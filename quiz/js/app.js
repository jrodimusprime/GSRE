const QuizApp = (() => {
  let timerInterval = null;
  let currentModule = null;

  async function init() {
    const config = await QuizLoader.loadSections();
    const counts = {};
    for (const m of config.modules) {
      const qs = await QuizLoader.getModuleQuestions(m.id);
      counts[m.id] = qs.length;
    }
    QuizUI.renderModules(config.modules, counts);
    bindHome(config);
  }

  function bindHome(config) {
    document.getElementById('module-grid').addEventListener('click', async (e) => {
      const card = e.target.closest('[data-module]');
      if (!card) return;
      await startStudy(card.dataset.module);
    });

    document.getElementById('exam-presets').addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-preset]');
      if (!btn) return;
      await startExam(btn.dataset.preset, config);
    });

    document.getElementById('segment-select').addEventListener('change', async (e) => {
      const seg = e.target.value;
      if (!seg) return;
      const qs = await QuizLoader.getSegmentQuestions(seg);
      startQuiz(qs, { mode: 'study', label: `SA-VIDEO: ${seg}` });
    });
  }

  async function startStudy(moduleId) {
    currentModule = moduleId;
    const qs = await QuizLoader.getModuleQuestions(moduleId);
    const mod = (await QuizLoader.loadSections()).modules.find((m) => m.id === moduleId);
    startQuiz(qs, { mode: 'study', label: mod?.title || moduleId });
  }

  async function startExam(presetId, config) {
    const preset = config.examPresets.find((p) => p.id === presetId);
    const qs = await QuizLoader.getExamQuestions(presetId);
    startQuiz(qs, {
      mode: 'exam',
      label: preset?.label || presetId,
      minutes: preset?.minutes || 0,
    });
  }

  function startQuiz(questions, opts) {
    if (!questions.length) {
      alert('No questions loaded for this module.');
      return;
    }
    QuizEngine.init(questions, opts);
    QuizUI.showScreen('quiz');
    document.getElementById('quiz-title').textContent = opts.label;
    bindQuiz(opts.mode);
    showCurrent(opts.mode);
    if (opts.minutes) {
      timerInterval = setInterval(() => {
        const rem = QuizEngine.timeRemaining();
        QuizUI.updateTimer(rem);
        if (rem <= 0) finishExam();
      }, 500);
    } else {
      QuizUI.updateTimer(null);
    }
  }

  function bindQuiz(mode) {
    const optsEl = document.getElementById('options');
    optsEl.replaceWith(optsEl.cloneNode(true));
    document.getElementById('options').addEventListener('click', (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn || btn.disabled) return;
      const idx = parseInt(btn.dataset.idx, 10);
      if (mode === 'study') {
        const result = QuizEngine.submit(idx);
        QuizUI.showFeedback(result.correct, result.explanation);
        document.getElementById('next-btn').classList.remove('hidden');
      } else {
        QuizEngine.examSubmit(idx);
        showCurrent('exam');
      }
    });

    document.getElementById('next-btn').onclick = () => {
      document.getElementById('next-btn').classList.add('hidden');
      if (QuizEngine.isDone()) {
        mode === 'exam' ? finishExam() : finishStudy();
      } else {
        showCurrent(mode);
      }
    };

    document.getElementById('quit-btn').onclick = () => {
      clearInterval(timerInterval);
      QuizUI.showScreen('home');
    };
  }

  function showCurrent(mode) {
    const q = QuizEngine.current();
    if (!q) return;
    const { index, total } = QuizEngine.progress();
    QuizUI.renderQuestion(
      q,
      QuizEngine.currentShuffledOptions(),
      `Question ${index + 1} of ${total}`
    );
    if (mode === 'exam') {
      document.getElementById('next-btn').classList.remove('hidden');
      document.getElementById('next-btn').textContent = 'Next';
    } else {
      document.getElementById('next-btn').classList.add('hidden');
      document.getElementById('next-btn').textContent = 'Next question';
    }
  }

  function finishStudy() {
    clearInterval(timerInterval);
    QuizUI.renderResults(QuizEngine.results());
  }

  function finishExam() {
    clearInterval(timerInterval);
    const r = QuizEngine.results();
    QuizUI.renderResults(r);
  }

  document.addEventListener('DOMContentLoaded', init);
  return { init };
})();
