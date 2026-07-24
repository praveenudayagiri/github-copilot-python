// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];

function getBoardInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  return boardDiv.getElementsByTagName('input');
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
      inp.className = 'sudoku-cell prefilled';
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

async function newGame() {
  const difficultySelect = document.getElementById('difficulty');
  const difficulty = difficultySelect.value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  difficultySelect.value = data.difficulty || 'medium';
  renderPuzzle(data.puzzle);
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
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.classList.remove('incorrect');
    if (incorrect.has(idx)) {
      inp.classList.add('incorrect');
    }
  }
  if (incorrect.size === 0) {
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  // initialize
  newGame();
});