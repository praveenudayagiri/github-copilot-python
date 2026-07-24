// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const STORAGE_KEY = 'sudoku-leaderboard-scores';
let puzzle = [];
let timerIntervalId = null;
let elapsedSeconds = 0;
let hintsUsed = 0;
let leaderboard = [];
let hasSavedScore = false;

function updateHintCount(count) {
  hintsUsed = count;
  const hintCount = document.getElementById('hint-count');
  if (hintCount) {
    hintCount.textContent = `Hints used: ${count}`;
  }
}

function getBoardInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  return boardDiv.getElementsByTagName('input');
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(elapsedSeconds);
  }
}

function stopTimer() {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerIntervalId = window.setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.setAttribute('aria-invalid', 'false');
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        refreshConflictState();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const inputs = getBoardInputs();
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className = 'sudoku-cell prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.className = 'sudoku-cell';
      }
      inp.setAttribute('aria-invalid', 'false');
    }
  }
  refreshConflictState();
}

function readBoardFromDOM() {
  const inputs = getBoardInputs();
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function addConflictIfDuplicate(conflicts, board, inputs, row, col, otherRow, otherCol) {
  if (otherRow === row && otherCol === col) {
    return;
  }

  const idx = row * SIZE + col;
  const otherIdx = otherRow * SIZE + otherCol;
  const otherInput = inputs[otherIdx];
  const value = board[row][col];
  const otherValue = board[otherRow][otherCol];

  if (value === 0 || otherValue === 0 || value !== otherValue) {
    return;
  }

  conflicts.add(idx);
  if (!otherInput.disabled) {
    conflicts.add(otherIdx);
  }
}

function addConflictsForPositions(conflicts, board, inputs, row, col, positions) {
  positions.forEach(([otherRow, otherCol]) => {
    addConflictIfDuplicate(conflicts, board, inputs, row, col, otherRow, otherCol);
  });
}

function findConflictingCells(board) {
  const inputs = getBoardInputs();
  const conflicts = new Set();

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const idx = row * SIZE + col;
      const input = inputs[idx];
      const value = board[row][col];

      if (input.disabled || value === 0) {
        continue;
      }

      const rowPositions = Array.from({length: SIZE}, (_, otherCol) => [row, otherCol]);
      const colPositions = Array.from({length: SIZE}, (_, otherRow) => [otherRow, col]);
      const boxRowStart = Math.floor(row / 3) * 3;
      const boxColStart = Math.floor(col / 3) * 3;
      const boxPositions = [];

      for (let boxRow = boxRowStart; boxRow < boxRowStart + 3; boxRow++) {
        for (let boxCol = boxColStart; boxCol < boxColStart + 3; boxCol++) {
          boxPositions.push([boxRow, boxCol]);
        }
      }

      addConflictsForPositions(conflicts, board, inputs, row, col, rowPositions);
      addConflictsForPositions(conflicts, board, inputs, row, col, colPositions);
      addConflictsForPositions(conflicts, board, inputs, row, col, boxPositions);
    }
  }

  return conflicts;
}

function applyConflictStyles(conflicts) {
  const inputs = getBoardInputs();
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    const hasIncorrect = inp.classList.contains('incorrect');

    if (inp.disabled) {
      if (inp.classList.contains('hinted')) {
        inp.className = 'sudoku-cell hinted';
      } else {
        inp.className = 'sudoku-cell prefilled';
      }
      inp.setAttribute('aria-invalid', 'false');
      continue;
    }

    inp.className = 'sudoku-cell';
    if (hasIncorrect) {
      inp.classList.add('incorrect');
    }
    inp.setAttribute('aria-invalid', 'false');

    if (conflicts.has(idx)) {
      inp.classList.add('conflict');
      inp.setAttribute('aria-invalid', 'true');
    }
  }
}

function updateConflictStatus(conflicts) {
  const status = document.getElementById('conflict-status');
  if (!status) {
    return;
  }

  if (conflicts.size === 0) {
    status.textContent = 'No conflicts detected.';
  } else {
    status.textContent = 'Conflicts detected.';
  }
}

function refreshConflictState() {
  const board = readBoardFromDOM();
  const conflicts = findConflictingCells(board);
  applyConflictStyles(conflicts);
  updateConflictStatus(conflicts);
}

function loadLeaderboard() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      leaderboard = [];
      renderLeaderboard();
      return;
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      leaderboard = [];
      renderLeaderboard();
      return;
    }

    leaderboard = parsed
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }

        const timeSeconds = Number(entry.timeSeconds);
        const hintsUsedCount = Number(entry.hintsUsed);
        const normalizedName = typeof entry.playerName === 'string' ? entry.playerName : '';
        const normalizedDifficulty = typeof entry.difficulty === 'string' ? entry.difficulty : 'medium';

        if (!Number.isFinite(timeSeconds) || timeSeconds < 0 || !Number.isFinite(hintsUsedCount) || hintsUsedCount < 0) {
          return null;
        }

        return {
          id: typeof entry.id === 'string' ? entry.id : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          playerName: normalizedName.trim() || 'Anonymous',
          timeSeconds,
          difficulty: normalizedDifficulty,
          hintsUsed: hintsUsedCount
        };
      })
      .filter(Boolean)
      .sort((first, second) => first.timeSeconds - second.timeSeconds)
      .slice(0, 10);
  } catch (error) {
    leaderboard = [];
  }

  renderLeaderboard();
}

function saveLeaderboard() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
  } catch (error) {
    // Ignore storage errors so the game remains usable.
  }
}

function renderLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboard-body');
  if (!leaderboardBody) {
    return;
  }

  if (leaderboard.length === 0) {
    leaderboardBody.innerHTML = '<tr><td colspan="5" class="leaderboard-empty">No completed games yet.</td></tr>';
    return;
  }

  leaderboardBody.innerHTML = leaderboard
    .map((entry, index) => {
      const rank = index + 1;
      return `
        <tr>
          <td>${rank}</td>
          <td>${entry.playerName}</td>
          <td>${formatTime(entry.timeSeconds)}</td>
          <td>${entry.difficulty}</td>
          <td>${entry.hintsUsed}</td>
        </tr>
      `;
    })
    .join('');
}

function addScoreToLeaderboard(playerName, timeSeconds, difficulty, hintsUsedCount) {
  const normalizedName = playerName && playerName.trim() ? playerName.trim() : 'Anonymous';
  const newScore = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    playerName: normalizedName,
    timeSeconds,
    difficulty,
    hintsUsed: hintsUsedCount
  };

  leaderboard = [...leaderboard, newScore]
    .sort((first, second) => first.timeSeconds - second.timeSeconds)
    .slice(0, 10);
  saveLeaderboard();
  renderLeaderboard();
}

function saveCompletedGame() {
  const difficultySelect = document.getElementById('difficulty');
  const difficulty = difficultySelect ? difficultySelect.value : 'medium';
  const playerName = window.prompt('Enter your name for the leaderboard:', '');
  if (playerName === null) {
    return;
  }

  addScoreToLeaderboard(playerName, elapsedSeconds, difficulty, hintsUsed);
  hasSavedScore = true;
}

async function newGame() {
  hasSavedScore = false;
  startTimer();

  const difficultySelect = document.getElementById('difficulty');
  const difficulty = difficultySelect.value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  difficultySelect.value = data.difficulty || 'medium';
  renderPuzzle(data.puzzle);
  updateHintCount(0);
  document.getElementById('message').innerText = '';
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0] * SIZE + x[1]));
  const isBoardComplete = board.every(row => row.every(cell => cell !== 0));

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.classList.remove('incorrect');
    if (incorrect.has(idx)) {
      inp.classList.add('incorrect');
    }
  }

  if (incorrect.size === 0 && isBoardComplete) {
    stopTimer();
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
    if (!hasSavedScore) {
      saveCompletedGame();
    }
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function useHint() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }

  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (!res.ok) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.message || data.error || 'Unable to provide hint.';
    return;
  }

  const idx = data.row * SIZE + data.col;
  const inp = inputs[idx];
  if (inp) {
    inp.value = data.value;
    inp.disabled = true;
    inp.className = 'sudoku-cell hinted';
    inp.setAttribute('aria-invalid', 'false');
    puzzle[data.row][data.col] = data.value;
  }
  updateHintCount(data.hint_count);
  refreshConflictState();
  msg.style.color = '#0f766e';
  msg.innerText = 'Hint applied.';
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', useHint);
  loadLeaderboard();
  newGame();
});