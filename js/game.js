// ── STATE ──────────────────────────────────────────────
let currentDay = 0;
let currentGuess = [];
let guesses = [];
let results = [];
let gameOver = false;
let hintUsed = false;
let keyStates = {};

function storageKey(d) { return `bandle_day_${d}`; }

function loadDay(d) {
  try { const r = localStorage.getItem(storageKey(d)); return r ? JSON.parse(r) : null; }
  catch (e) { return null; }
}

function saveDay(d, data) {
  try { localStorage.setItem(storageKey(d), JSON.stringify(data)); } catch (e) {}
}

function getAvailableDays() {
  const [y, m, d] = LAUNCH_DATE.split('-').map(Number);
  const launch = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - launch) / 86400000);
  return Math.min(Math.max(diff + 1, 1), SHOWS.length);
}

function computeResult(guess, answer) {
  const result = Array(answer.length).fill('absent');
  const used = Array(answer.length).fill(false);
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) { result[i] = 'correct'; used[i] = true; }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    for (let j = 0; j < answer.length; j++) {
      if (!used[j] && guess[i] === answer[j]) { result[i] = 'present'; used[j] = true; break; }
    }
  }
  return result;
}

function updateKeyStates(guess, result) {
  const p = { correct: 3, present: 2, absent: 1 };
  guess.split('').forEach((ch, i) => {
    if (!keyStates[ch] || p[result[i]] > p[keyStates[ch]]) keyStates[ch] = result[i];
  });
}

function buildGrid() {
  const show = SHOWS[currentDay];
  const container = document.getElementById('grid-container');
  container.innerHTML = '';
  document.getElementById('space-hint').style.display = show.hasSpace ? 'block' : 'none';
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement('div');
    row.className = 'grid-row';
    row.id = `row-${r}`;
    for (let c = 0; c < show.word.length; c++) {
      if (show.hasSpace && c === show.spaceAfter) {
        const g = document.createElement('div');
        g.className = 'tile space-gap';
        row.appendChild(g);
      }
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${r}-${c}`;
      row.appendChild(tile);
    }
    container.appendChild(row);
  }
}

function renderGuesses() {
  const show = SHOWS[currentDay];
  guesses.forEach((guess, r) => {
    const res = results[r];
    for (let c = 0; c < show.word.length; c++) {
      const t = document.getElementById(`tile-${r}-${c}`);
      if (t) {
        t.textContent = guess[c];
        t.className = `tile ${res[c]}`;
        t.style.animationDelay = `${c * 80}ms`;
      }
    }
  });
}

function renderCurrentGuess() {
  const show = SHOWS[currentDay];
  const r = guesses.length;
  if (r >= MAX_GUESSES) return;
  for (let c = 0; c < show.word.length; c++) {
    const t = document.getElementById(`tile-${r}-${c}`);
    if (!t) continue;
    const ch = currentGuess[c] || '';
    t.textContent = ch;
    t.className = ch ? 'tile filled' : 'tile';
  }
}

function renderKeyboard() {
  KEYS.forEach((row, ri) => {
    const rowEl = document.getElementById(`row${ri + 1}`);
    rowEl.innerHTML = '';
    const isBottom = ri === KEYS.length - 1;
    row.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'key' + (k.length > 1 ? ' wide' : '');
      if (isBottom) btn.style.flex = '1';
      btn.textContent = k;
      btn.dataset.key = k;
      if (keyStates[k]) btn.classList.add(keyStates[k]);
      btn.addEventListener('click', () => handleKey(k));
      rowEl.appendChild(btn);
    });
  });
}

function renderDayNav() {
  const nav = document.getElementById('day-nav');
  nav.innerHTML = '';
  const available = getAvailableDays();
  for (let i = 0; i < SHOWS.length; i++) {
    const btn = document.createElement('button');
    btn.className = 'day-btn';
    btn.dataset.day = i;
    if (i < available) {
      const saved = loadDay(i);
      btn.textContent = `Day ${i + 1}`;
      if (saved && saved.gameOver) btn.classList.add('solved');
      if (i === currentDay) btn.classList.add('active');
      btn.addEventListener('click', () => switchDay(i));
    } else {
      btn.textContent = '🔒';
      btn.style.opacity = '0.3';
      btn.style.cursor = 'default';
      btn.title = 'Not yet available';
    }
    nav.appendChild(btn);
  }
}

function renderDayLabel() {
  document.getElementById('day-label').textContent = `Day ${currentDay + 1} of ${SHOWS.length}`;
}

function updateSolvedBanner() {
  const b = document.getElementById('solved-banner');
  if (gameOver) {
    b.style.display = 'block';
    b.textContent = `✓ Day ${currentDay + 1} solved — tap to see results`;
    b.onclick = showModal;
  } else {
    b.style.display = 'none';
  }
}

function updateHintUI() {
  const show = SHOWS[currentDay];
  const hb = document.getElementById('hint-btn');
  const hd = document.getElementById('hint-display');
  const onLast = guesses.length === MAX_GUESSES - 1 && !gameOver;
  if (hintUsed) {
    hb.style.display = 'none';
    hd.style.display = 'flex';
    document.getElementById('hint-emoji').textContent = show.hint;
  } else if (onLast) {
    hb.style.display = 'inline-block';
    hd.style.display = 'none';
  } else {
    hb.style.display = 'none';
    hd.style.display = 'none';
  }
}

function renderAll() {
  buildGrid();
  renderGuesses();
  renderCurrentGuess();
  renderKeyboard();
  renderDayNav();
  renderDayLabel();
  updateHintUI();
  updateSolvedBanner();
}

function handleKey(key) {
  if (gameOver) return;
  const wordLen = SHOWS[currentDay].word.length;
  if (key === '⌫' || key === 'Backspace') { currentGuess.pop(); renderCurrentGuess(); return; }
  if (key === 'ENTER' || key === 'Enter') { submitGuess(); return; }
  if (/^[A-Za-z]$/.test(key) && currentGuess.length < wordLen) {
    currentGuess.push(key.toUpperCase());
    renderCurrentGuess();
    const t = document.getElementById(`tile-${guesses.length}-${currentGuess.length - 1}`);
    if (t) { t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); }
  }
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  handleKey(e.key);
});

function submitGuess() {
  const show = SHOWS[currentDay];
  const wordLen = show.word.length;
  if (currentGuess.length < wordLen) { shakeRow(guesses.length); toast('Not enough letters'); return; }
  const guessStr = currentGuess.join('');
  const result = computeResult(guessStr, show.word);
  updateKeyStates(guessStr, result);
  guesses.push(guessStr);
  results.push(result);
  for (let c = 0; c < wordLen; c++) {
    const t = document.getElementById(`tile-${guesses.length - 1}-${c}`);
    if (t) setTimeout(() => { t.className = `tile ${result[c]}`; }, c * 80);
  }
  currentGuess = [];
  const won = guessStr === show.word;
  const lost = !won && guesses.length >= MAX_GUESSES;
  if (won || lost) {
    gameOver = true;
    saveState();
    setTimeout(() => won ? showModal() : showLossModal(), wordLen * 80 + 300);
  } else {
    saveState();
  }
  setTimeout(() => {
    renderKeyboard();
    renderCurrentGuess();
    updateHintUI();
    renderDayNav();
    updateSolvedBanner();
  }, wordLen * 80 + 50);
}

function shakeRow(r) {
  const row = document.getElementById(`row-${r}`);
  if (!row) return;
  row.classList.remove('shake');
  void row.offsetWidth;
  row.classList.add('shake');
  setTimeout(() => row.classList.remove('shake'), 400);
}

function toast(msg, dur = 1800) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

function buildShareGrid() {
  const map = { correct: '🟥', present: '🟨', absent: '⬛' };
  return results.map((res, ri) => {
    let l = res.map(r => map[r]).join('');
    if (ri === MAX_GUESSES - 1 && hintUsed) l += ' 🌪️';
    return l;
  }).join('\n');
}

function showModal() {
  const show = SHOWS[currentDay];
  document.getElementById('modal-heading').textContent = 'You got it!';
  document.getElementById('modal-word').textContent = show.displayWord;
  document.getElementById('modal-desc').textContent = show.desc;
  document.getElementById('modal-grid').innerHTML = buildShareGrid().replace(/\n/g, '<br>');
  document.getElementById('modal-overlay').classList.add('show');
}

function showLossModal() {
  const show = SHOWS[currentDay];
  document.getElementById('modal-heading').textContent = 'Nice try!';
  document.getElementById('modal-word').textContent = `The answer was: ${show.displayWord}`;
  document.getElementById('modal-desc').textContent = show.desc;
  document.getElementById('modal-grid').innerHTML = buildShareGrid().replace(/\n/g, '<br>');
  document.getElementById('modal-overlay').classList.add('show');
}

document.getElementById('close-modal-btn').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('show');
});

document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) this.classList.remove('show');
});

document.getElementById('copy-btn').addEventListener('click', () => {
  const show = SHOWS[currentDay];
  const won = guesses[guesses.length - 1] === show.word;
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const text = `Bandle — Day ${currentDay + 1}\n${score}${hintUsed ? ' 🌪️' : ''}\n\n${buildShareGrid()}\n\nISUCF'V'MB Cyclone Marching Band`;
  navigator.clipboard.writeText(text).then(() => toast('Copied!')).catch(() => toast('Copy failed'));
});

document.getElementById('hint-btn').addEventListener('click', () => {
  hintUsed = true;
  saveState();
  toast(`Hint: ${SHOWS[currentDay].hint}`, 2500);
  updateHintUI();
});

function saveState() {
  saveDay(currentDay, { guesses, results, gameOver, hintUsed });
}

function loadState() {
  const s = loadDay(currentDay);
  if (s) {
    guesses = s.guesses || [];
    results = s.results || [];
    gameOver = s.gameOver || false;
    hintUsed = s.hintUsed || false;
  } else {
    guesses = [];
    results = [];
    gameOver = false;
    hintUsed = false;
  }
  currentGuess = [];
  keyStates = {};
  guesses.forEach((g, i) => updateKeyStates(g, results[i]));
}

function switchDay(day) {
  currentDay = day;
  loadState();
  renderAll();
}

function init() {
  currentDay = Math.min(getAvailableDays() - 1, SHOWS.length - 1);
  loadState();
  renderAll();
}

init();
