// ========== APP STATE ==========
const state = {
  screen: 'home',        // 'home' | 'setup' | 'quiz' | 'results'
  section: 'v1',
  questionCount: 20,
  timeLimit: 30,
  questions: [],
  currentIndex: 0,
  answers: [],
  timer: null,
  timeLeft: 0,
  totalTime: 0,
  startTime: null,
};

const SECTION_NAMES = {
  v1: '📋 Вариант 1',
  v2: '📋 Вариант 2',
  v3: '📋 Вариант 3',
  v4: '📋 Вариант 4',
  all: '🎯 Все варианты'
};

const SECTION_COUNTS = { v1: 25, v2: 25, v3: 25, v4: 25, all: 100 };

// ========== RENDER ENGINE ==========
function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  switch (state.screen) {
    case 'home':    app.appendChild(renderHome()); break;
    case 'setup':   app.appendChild(renderSetup()); break;
    case 'quiz':    app.appendChild(renderQuiz()); break;
    case 'results': app.appendChild(renderResults()); break;
  }
}

// ========== HOME SCREEN ==========
function renderHome() {
  const el = createElement('div', 'screen home-screen');
  el.innerHTML = `
    <div class="home-bg-grid"></div>
    <div class="home-content">
      <div class="home-badge">📋 Квалификационный тест</div>
      <h1 class="home-title">КвалТест</h1>
      <p class="home-sub">Выберите вариант для прохождения теста.</p>
      <div class="section-cards">
        <div class="section-card v1" onclick="selectSectionAndStart('v1')">
          <div class="sc-icon">1️⃣</div>
          <div class="sc-name">Вариант 1</div>
          <div class="sc-desc">Охрана труда, арматура, бетон</div>
          <div class="sc-count">25 вопросов</div>
        </div>
        <div class="section-card v2" onclick="selectSectionAndStart('v2')">
          <div class="sc-icon">2️⃣</div>
          <div class="sc-name">Вариант 2</div>
          <div class="sc-desc">Безопасность, каменные работы</div>
          <div class="sc-count">25 вопросов</div>
        </div>
        <div class="section-card v3" onclick="selectSectionAndStart('v3')">
          <div class="sc-icon">3️⃣</div>
          <div class="sc-name">Вариант 3</div>
          <div class="sc-desc">Охрана труда, бетонные работы</div>
          <div class="sc-count">25 вопросов</div>
        </div>
        <div class="section-card v4" onclick="selectSectionAndStart('v4')">
          <div class="sc-icon">4️⃣</div>
          <div class="sc-name">Вариант 4</div>
          <div class="sc-desc">Освещённость, безопасность, бетон</div>
          <div class="sc-count">25 вопросов</div>
        </div>
        <div class="section-card all" onclick="selectSectionAndStart('all')">
          <div class="sc-icon">🎯</div>
          <div class="sc-name">Все варианты</div>
          <div class="sc-desc">Вопросы из всех вариантов</div>
          <div class="sc-count">100 вопросов</div>
        </div>
      </div>
      <p class="home-hint">Нажмите на вариант, чтобы начать</p>
    </div>
  `;
  return el;
}

function selectSectionAndStart(section) {
  state.section = section;
  state.screen = 'setup';
  // Reset question count to a sensible default for the chosen section
  const max = SECTION_COUNTS[section];
  state.questionCount = Math.min(state.questionCount, max);
  render();
}

// ========== SETUP SCREEN ==========
function renderSetup() {
  const maxQ = SECTION_COUNTS[state.section];

  const el = createElement('div', 'screen setup-screen');
  el.innerHTML = `
    <button class="back-btn" onclick="goHome()">← Назад</button>
    <div class="setup-content">
      <div class="setup-section-badge ${state.section}">${SECTION_NAMES[state.section]}</div>
      <h2 class="setup-title">Настройка теста</h2>

      <div class="setup-section">
        <label class="setup-label">Количество вопросов</label>
        <div class="count-grid" id="countGrid">
          ${[10, 15, 20, 'Все'].map(n => {
            const val = n === 'Все' ? maxQ : n;
            const actual = Math.min(val, maxQ);
            return `<button class="count-btn ${state.questionCount === actual ? 'active' : ''}" 
                      onclick="setQuestionCount(${actual})" 
                      ${actual < val ? 'disabled title="Недостаточно вопросов"' : ''}>
                      ${n === 'Все' ? `Все (${maxQ})` : n}
                    </button>`;
          }).join('')}
        </div>
        <div class="custom-count">
          <label>Своё количество:</label>
          <input type="number" id="customCount" min="1" max="${maxQ}" 
                 value="${state.questionCount}" oninput="setCustomCount(this.value, ${maxQ})">
          <span class="max-hint">макс. ${maxQ}</span>
        </div>
      </div>

      <div class="setup-section">
        <label class="setup-label">Время на вопрос</label>
        <div class="time-grid" id="timeGrid">
          ${[
            { val: 10, label: '10 сек', icon: '⚡' },
            { val: 20, label: '20 сек', icon: '🏃' },
            { val: 30, label: '30 сек', icon: '🚶' },
            { val: 60, label: '1 мин', icon: '🧘' },
            { val: 120, label: '2 мин', icon: '🛋️' },
            { val: 0, label: 'Без лимита', icon: '∞' },
          ].map(t => `
            <button class="time-btn ${state.timeLimit === t.val ? 'active' : ''}" onclick="setTimeLimit(${t.val})">
              <span class="tb-icon">${t.icon}</span>
              <span class="tb-label">${t.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="setup-summary">
        <div class="sum-item"><span>Вариант</span><strong>${SECTION_NAMES[state.section]}</strong></div>
        <div class="sum-item"><span>Вопросов</span><strong id="sumCount">${state.questionCount}</strong></div>
        <div class="sum-item"><span>Время</span><strong id="sumTime">${state.timeLimit === 0 ? '∞' : state.timeLimit + ' сек'}</strong></div>
        <div class="sum-item"><span>~Итого</span><strong id="sumTotal">${state.timeLimit === 0 ? '—' : formatTime(state.timeLimit * state.questionCount)}</strong></div>
      </div>

      <button class="start-btn" onclick="startQuiz()">
        <span>Начать тест</span>
        <span class="start-arrow">→</span>
      </button>
    </div>
  `;
  return el;
}

function setQuestionCount(n) {
  state.questionCount = n;
  document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('customCount').value = n;
  updateSummary();
}

function setCustomCount(val, max) {
  const n = Math.min(Math.max(1, parseInt(val) || 1), max);
  state.questionCount = n;
  document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
  updateSummary();
}

function setTimeLimit(val) {
  state.timeLimit = val;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  updateSummary();
}

function updateSummary() {
  const sc = document.getElementById('sumCount');
  const st = document.getElementById('sumTime');
  const stot = document.getElementById('sumTotal');
  if (sc) sc.textContent = state.questionCount;
  if (st) st.textContent = state.timeLimit === 0 ? '∞' : state.timeLimit + ' сек';
  if (stot) stot.textContent = state.timeLimit === 0 ? '—' : formatTime(state.timeLimit * state.questionCount);
}

function goHome() {
  clearInterval(state.timer);
  state.screen = 'home';
  render();
}

// ========== QUIZ SCREEN ==========
function startQuiz() {
  state.questions = getQuestionsBySection(state.section, state.questionCount);
  state.currentIndex = 0;
  state.answers = [];
  state.startTime = Date.now();
  state.totalTime = 0;
  state.screen = 'quiz';
  render();
  if (state.timeLimit > 0) startTimer();
}

function renderQuiz() {
  const q = state.questions[state.currentIndex];
  const progress = ((state.currentIndex) / state.questions.length) * 100;
  const sectionClass = q.section || state.section;

  const el = createElement('div', 'screen quiz-screen');
  el.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-meta">
        <span class="q-section-tag ${sectionClass}">${SECTION_NAMES[sectionClass] || sectionClass}</span>
        <span class="q-counter">${state.currentIndex + 1} / ${state.questions.length}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="quiz-timer-row">
        ${state.timeLimit > 0 ? `
          <div class="timer-wrap" id="timerWrap">
            <div class="timer-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" class="ring-bg"/>
                <circle cx="20" cy="20" r="16" class="ring-fill" id="ringFill"/>
              </svg>
              <span class="timer-num" id="timerNum">${state.timeLimit}</span>
            </div>
          </div>
        ` : '<div class="timer-placeholder">∞</div>'}
      </div>
    </div>

    <div class="question-card" id="questionCard">
      <div class="q-number">Вопрос ${state.currentIndex + 1}</div>
      <div class="q-text">${q.question}</div>
    </div>

    <div class="options-grid" id="optionsGrid">
      ${q.options.map((opt, i) => `
        <button class="option-btn" onclick="selectAnswer(${i})" data-idx="${i}">
          <span class="opt-letter">${['А', 'Б', 'В', 'Г', 'Д'][i]}</span>
          <span class="opt-text">${opt}</span>
        </button>
      `).join('')}
    </div>

    <div class="quiz-footer">
      <div class="answered-track">
        ${state.answers.map((a) => `<div class="track-dot ${a.correct ? 'correct' : 'wrong'}"></div>`).join('')}
        <div class="track-dot current"></div>
        ${Array(state.questions.length - state.currentIndex - 1).fill('<div class="track-dot pending"></div>').join('')}
      </div>
      <button class="skip-btn" onclick="skipQuestion()">Пропустить →</button>
    </div>
  `;
  return el;
}

function startTimer() {
  clearInterval(state.timer);
  state.timeLeft = state.timeLimit;
  updateTimerUI();
  state.timer = setInterval(() => {
    state.timeLeft--;
    updateTimerUI();
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      autoSkip();
    }
  }, 1000);
}

function updateTimerUI() {
  const num = document.getElementById('timerNum');
  const ring = document.getElementById('ringFill');
  const wrap = document.getElementById('timerWrap');
  if (!num) return;
  num.textContent = state.timeLeft;
  const pct = state.timeLeft / state.timeLimit;
  const circumference = 2 * Math.PI * 16;
  if (ring) ring.style.strokeDashoffset = circumference * (1 - pct);
  if (wrap) {
    wrap.classList.remove('timer-warning', 'timer-danger');
    if (pct <= 0.2) wrap.classList.add('timer-danger');
    else if (pct <= 0.4) wrap.classList.add('timer-warning');
  }
}

function autoSkip() {
  const q = state.questions[state.currentIndex];
  state.answers.push({ questionId: q.id, chosen: -1, correct: false, time: state.timeLimit });
  nextQuestion();
}

function selectAnswer(idx) {
  clearInterval(state.timer);
  const q = state.questions[state.currentIndex];
  const isCorrect = idx === q.correct;
  const timeTaken = state.timeLimit > 0 ? state.timeLimit - state.timeLeft : 0;
  state.answers.push({ questionId: q.id, chosen: idx, correct: isCorrect, time: timeTaken });

  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.disabled = true);
  buttons[q.correct].classList.add('correct-answer');
  if (!isCorrect) buttons[idx].classList.add('wrong-answer');

  setTimeout(() => nextQuestion(), 900);
}

function skipQuestion() {
  clearInterval(state.timer);
  const q = state.questions[state.currentIndex];
  state.answers.push({ questionId: q.id, chosen: -1, correct: false, time: state.timeLimit > 0 ? state.timeLeft : 0 });
  nextQuestion();
}

function nextQuestion() {
  if (state.currentIndex + 1 >= state.questions.length) {
    state.totalTime = Math.round((Date.now() - state.startTime) / 1000);
    state.screen = 'results';
    render();
  } else {
    state.currentIndex++;
    render();
    if (state.timeLimit > 0) startTimer();
  }
}

// ========== RESULTS SCREEN ==========
function renderResults() {
  const correct = state.answers.filter(a => a.correct).length;
  const total = state.answers.length;
  const pct = Math.round((correct / total) * 100);
  const skipped = state.answers.filter(a => a.chosen === -1).length;
  const grade = getGrade(pct);

  const wrongAnswers = state.answers
    .map((a, i) => ({ answer: a, question: state.questions[i] }))
    .filter(item => !item.answer.correct);

  const el = createElement('div', 'screen results-screen');
  el.innerHTML = `
    <div class="results-content">
      <div class="results-hero">
        <div class="grade-emoji">${grade.emoji}</div>
        <div class="grade-label" style="color: ${grade.color}">${grade.label}</div>
        <div class="score-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" class="score-ring-bg"/>
            <circle cx="60" cy="60" r="50" class="score-ring-fill" 
              style="stroke: ${grade.color}; stroke-dashoffset: ${314 * (1 - pct / 100)}"/>
          </svg>
          <div class="score-text">
            <div class="score-pct">${pct}%</div>
            <div class="score-sub">${correct}/${total}</div>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-val correct-col">${correct}</div>
          <div class="stat-key">Правильно</div>
        </div>
        <div class="stat-box">
          <div class="stat-val wrong-col">${total - correct - skipped}</div>
          <div class="stat-key">Неверно</div>
        </div>
        <div class="stat-box">
          <div class="stat-val skip-col">${skipped}</div>
          <div class="stat-key">Пропущено</div>
        </div>
        <div class="stat-box">
          <div class="stat-val time-col">${formatTime(state.totalTime)}</div>
          <div class="stat-key">Общее время</div>
        </div>
      </div>

      ${wrongAnswers.length > 0 ? `
        <div class="wrong-section">
          <h3 class="wrong-title">Ошибки и правильные ответы</h3>
          <div class="wrong-list">
            ${wrongAnswers.map(({ answer, question }) => `
              <div class="wrong-item">
                <div class="wi-q">${question.question}</div>
                <div class="wi-answers">
                  ${answer.chosen !== -1 ? `<div class="wi-wrong">✗ ${question.options[answer.chosen]}</div>` : `<div class="wi-skip">— Пропущено</div>`}
                  <div class="wi-correct">✓ ${question.options[question.correct]}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `<div class="perfect-msg">🏆 Все ответы верны! Отличная работа!</div>`}

      <div class="results-actions">
        <button class="action-btn primary" onclick="restartSame()">🔄 Снова тот же тест</button>
        <button class="action-btn secondary" onclick="goSetup()">⚙️ Изменить настройки</button>
        <button class="action-btn ghost" onclick="goHome()">🏠 На главную</button>
      </div>
    </div>
  `;
  return el;
}

function restartSame() {
  state.questions = getQuestionsBySection(state.section, state.questionCount);
  state.currentIndex = 0;
  state.answers = [];
  state.startTime = Date.now();
  state.screen = 'quiz';
  render();
  if (state.timeLimit > 0) startTimer();
}

function goSetup() {
  state.screen = 'setup';
  render();
}

// ========== HELPERS ==========
function createElement(tag, className) {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}

function formatTime(seconds) {
  if (seconds < 60) return seconds + ' сек';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}м ${s}с` : `${m} мин`;
}

function getGrade(pct) {
  if (pct >= 90) return { label: 'Превосходно!', emoji: '🏆', color: '#FFD700' };
  if (pct >= 75) return { label: 'Отлично!', emoji: '🌟', color: '#4CAF50' };
  if (pct >= 60) return { label: 'Хорошо', emoji: '👍', color: '#2196F3' };
  if (pct >= 40) return { label: 'Неплохо', emoji: '📚', color: '#FF9800' };
  return { label: 'Нужно повторить', emoji: '💪', color: '#F44336' };
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => render());