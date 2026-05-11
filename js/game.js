// ── STATE ──────────────────────────────────────────────
let currentDay = 0;
let currentGuess = [];
let guesses = [];
let results = [];
let gameOver = false;
let hintUsed = false;
let keyStates = {};

function storageKey(d) { return `bandle_v2_day_${d}`; }

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
  return Math.min(Math.max(diff + 1, 1), WORDS.length);
}

function getDayDate(dayIndex) {
  const [y, m, d] = LAUNCH_DATE.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + dayIndex);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getWord() { return WORDS[currentDay][0]; }
function getHint() { return WORDS[currentDay][1]; }
function getDesc() { return WORDS[currentDay][2] || ''; }
function getGapAfter() { return WORDS[currentDay][3] ?? -1; }

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
  const word = getWord();
  const gapAfter = getGapAfter();
  const container = document.getElementById('grid-container');
  container.innerHTML = '';
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement('div');
    row.className = 'grid-row';
    row.id = `row-${r}`;
    for (let c = 0; c < word.length; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${r}-${c}`;
      row.appendChild(tile);
      if (c === gapAfter) {
        const spacer = document.createElement('div');
        spacer.className = 'tile-gap';
        row.appendChild(spacer);
      }
    }
    container.appendChild(row);
  }
}

function renderGuesses() {
  const word = getWord();
  guesses.forEach((guess, r) => {
    const res = results[r];
    for (let c = 0; c < word.length; c++) {
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
  const word = getWord();
  const r = guesses.length;
  if (r >= MAX_GUESSES) return;
  for (let c = 0; c < word.length; c++) {
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
  const available = getAvailableDays();
  const saved = loadDay(currentDay);
  const solved = saved && saved.gameOver;

  document.getElementById('day-number').textContent =
    `Day ${currentDay + 1}` + (solved ? ' ✓' : '');
  document.getElementById('day-date').textContent = getDayDate(currentDay);

  document.getElementById('prev-day').disabled = currentDay <= 0;
  document.getElementById('next-day').disabled = currentDay >= available - 1;
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
  const hb = document.getElementById('hint-btn');
  const hd = document.getElementById('hint-display');
  const onLast = guesses.length === MAX_GUESSES - 1 && !gameOver;
  if (hintUsed) {
    hb.style.display = 'none';
    hd.style.display = 'flex';
    document.getElementById('hint-emoji').textContent = getHint();
  } else if (onLast) {
    hb.style.display = 'inline-block';
    hd.style.display = 'none';
  } else {
    hb.style.display = 'none';
    hd.style.display = 'none';
  }
}

function updateResetBtn() {
  document.getElementById('reset-btn').style.display = gameOver ? 'inline-block' : 'none';
}

function updateDayBlurb() {
  const el = document.getElementById('day-blurb');
  if (currentDay < 7) {
    el.style.display = 'block';
    el.textContent = "Each of the first seven Bandle words is a theme for one of the Cyclone Marching Band's 2026 halftime shows!";
  } else {
    el.style.display = 'block';
    el.textContent = "We've already revealed our 2026 Show Themes in the first seven days of Bandle — but the fun doesn't stop there! Keep playing with new band-themed words every day.";
  }
}

function renderAll() {
  buildGrid();
  renderGuesses();
  renderCurrentGuess();
  renderKeyboard();
  renderDayNav();
  updateDayBlurb();
  updateHintUI();
  updateResetBtn();
  updateSolvedBanner();
}

function handleKey(key) {
  if (gameOver) return;
  const wordLen = getWord().length;
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
  const word = getWord();
  const wordLen = word.length;
  if (currentGuess.length < wordLen) { shakeRow(guesses.length); toast('Not enough letters'); return; }
  const guessStr = currentGuess.join('');
  const isAnswer = WORDS.some(w => w[0] === guessStr);
  if (!isAnswer && !DICT.has(guessStr)) { shakeRow(guesses.length); toast('Not in word list'); return; }
  const result = computeResult(guessStr, word);
  updateKeyStates(guessStr, result);
  guesses.push(guessStr);
  results.push(result);
  for (let c = 0; c < wordLen; c++) {
    const t = document.getElementById(`tile-${guesses.length - 1}-${c}`);
    if (t) setTimeout(() => { t.className = `tile ${result[c]}`; }, c * 80);
  }
  currentGuess = [];
  const won = guessStr === word;
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
    updateResetBtn();
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
  const map = { correct: '🟥', present: '🟨', absent: '⬜' };
  return results.map((res, ri) => {
    let l = res.map(r => map[r]).join('');
    if (ri === MAX_GUESSES - 1 && hintUsed) l += ' 🌪️';
    return l;
  }).join('\n');
}

function updateModalDesc() {
  const desc = getDesc();
  const el = document.getElementById('modal-desc');
  if (desc) { el.textContent = desc; el.style.display = 'block'; }
  else { el.style.display = 'none'; }
}

function showModal() {
  document.getElementById('modal-heading').textContent = 'You got it!';
  document.getElementById('modal-word').textContent = getWord();
  updateModalDesc();
  document.getElementById('modal-grid').innerHTML = buildShareGrid().replace(/\n/g, '<br>');
  document.getElementById('modal-overlay').classList.add('show');
}

function showLossModal() {
  document.getElementById('modal-heading').textContent = 'Nice try!';
  document.getElementById('modal-word').textContent = `The answer was: ${getWord()}`;
  updateModalDesc();
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
  const word = getWord();
  const won = guesses[guesses.length - 1] === word;
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const text = `Bandle — Day ${currentDay + 1}\n${score}${hintUsed ? ' 🌪️' : ''}\n\n${buildShareGrid()}\n\n@isucfvmb\n#isucfvmb #cyclonenation #marchingband\n\nPlay Bandle at https://bandle.iastate.band`;
  navigator.clipboard.writeText(text).then(() => toast('Copied!')).catch(() => toast('Copy failed'));
});

document.getElementById('image-btn').addEventListener('click', () => {
  const word = getWord();
  const won = guesses[guesses.length - 1] === word;
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const colors = { correct: '#C8102E', present: '#F1BE48', absent: '#787c7e' };
  const tileSize = 52;
  const gap = 6;
  const cols = word.length;
  const rows = results.length;
  const gridW = cols * tileSize + (cols - 1) * gap;
  const gridH = rows * tileSize + (rows - 1) * gap;
  const pad = 40;
  const w = gridW + pad * 2;
  const topH = 130;
  const botH = 120;
  const h = topH + gridH + botH;
  const c = document.createElement('canvas');
  c.width = w * 2; c.height = h * 2;
  const ctx = c.getContext('2d');
  ctx.scale(2, 2);
  ctx.fillStyle = '#1a0a0e';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#C8102E';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BANDLE', w / 2, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`Day ${currentDay + 1}  —  ${score}${hintUsed ? '  🌪️' : ''}`, w / 2, 68);
  ctx.fillStyle = '#9a7078';
  ctx.font = '11px sans-serif';
  ctx.fillText(getDayDate(currentDay), w / 2, 88);
  const legendY = 110;
  const sw = 12;
  const legendItems = [
    { color: colors.correct, label: 'Correct' },
    { color: colors.present, label: 'Wrong spot' },
    { color: colors.absent, label: 'Not in word' }
  ];
  ctx.font = 'bold 10px sans-serif';
  ctx.textBaseline = 'middle';
  const itemGap = 16;
  const innerGap = 6;
  const totalLegendW = legendItems.reduce((sum, item) => sum + sw + innerGap + ctx.measureText(item.label).width, 0) + itemGap * (legendItems.length - 1);
  let lx = (w - totalLegendW) / 2;
  legendItems.forEach((item, i) => {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.roundRect(lx, legendY - sw / 2, sw, sw, 2);
    ctx.fill();
    ctx.fillStyle = '#9a7078';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, lx + sw + innerGap, legendY);
    lx += sw + innerGap + ctx.measureText(item.label).width + itemGap;
  });
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const ox = pad;
  const oy = topH;
  results.forEach((res, ri) => {
    res.forEach((state, ci) => {
      const x = ox + ci * (tileSize + gap);
      const y = oy + ri * (tileSize + gap);
      ctx.fillStyle = colors[state];
      ctx.beginPath();
      ctx.roundRect(x, y, tileSize, tileSize, 4);
      ctx.fill();
    });
  });
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('@isucfvmb', w / 2, topH + gridH + 28);
  ctx.fillStyle = '#9a7078';
  ctx.font = '11px sans-serif';
  ctx.fillText('#isucfvmb  #cyclonenation  #marchingband', w / 2, topH + gridH + 50);
  ctx.fillStyle = '#F1BE48';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Play at bandle.iastate.band', w / 2, topH + gridH + 72);
  c.toBlob(blob => {
    const file = new File([blob], `bandle-day-${currentDay + 1}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).then(() => toast('Shared!')).catch(() => {});
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      toast('Image saved!');
    }
  });
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('bandle_theme', isDark ? 'dark' : 'light');
});

document.getElementById('hint-btn').addEventListener('click', () => {
  hintUsed = true;
  saveState();
  toast(`Hint: ${getHint()}`, 2500);
  updateHintUI();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  localStorage.removeItem(storageKey(currentDay));
  loadState();
  renderAll();
  toast('Day reset');
});

document.getElementById('prev-day').addEventListener('click', () => {
  if (currentDay > 0) switchDay(currentDay - 1);
});

document.getElementById('next-day').addEventListener('click', () => {
  if (currentDay < getAvailableDays() - 1) switchDay(currentDay + 1);
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
  currentDay = Math.min(getAvailableDays() - 1, WORDS.length - 1);
  loadState();
  renderAll();
}

init();
