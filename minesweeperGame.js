// minesweeperGame.js

export function setupMinesweeper(root) {
  // UI kurulum
  root.innerHTML = `
    <div id="mine-status" style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:6px;
      padding:4px;
      border-top:2px solid #7B7B7B;
      border-left:2px solid #7B7B7B;
      border-right:2px solid #FFFFFF;
      border-bottom:2px solid #FFFFFF;
      background:#BFBFBF;
      font-family:'MS Sans Serif', sans-serif;
      font-size:10px;
    ">
      <div>💣 <span id="mine-bombs-left"></span></div>
      <button id="mine-reset" class="button" style="min-width:20px;">🙂 Reset</button>
      <div>⏱ <span id="mine-timer">000</span>s</div>
    </div>
    <table id="mine-board" style="border-collapse:collapse; margin:0 auto;"></table>
    <div style="margin-top:4px; text-align:center; font-size:10px; font-family:'MS Sans Serif',sans-serif;">
      Left click: open • Right click: flag
    </div>
  `;

  const bombsLeftEl = root.querySelector('#mine-bombs-left');
  const timerEl     = root.querySelector('#mine-timer');
  const resetBtn    = root.querySelector('#mine-reset');
  const boardEl     = root.querySelector('#mine-board');

  const ROWS  = 9;
  const COLS  = 9;
  const BOMBS = 10;

  let grid = [];
  let revealedCount = 0;
  let flagCount = 0;
  let bombPositions = new Set();
  let gameOver = false;
  let timerId = null;
  let elapsed = 0;

  // =================== Timer ===================
  function startTimer() {
    if (timerId) return;
    timerId = setInterval(() => {
      elapsed += 1;
      timerEl.textContent = String(elapsed).padStart(3, '0');
    }, 1000);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  // =================== Helpers ===================
  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }

  function indexKey(r, c) {
    return `${r},${c}`;
  }

  function getNeighbors(r, c) {
    const deltas = [-1, 0, 1];
    const res = [];
    for (let dr of deltas) {
      for (let dc of deltas) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc)) res.push([nr, nc]);
      }
    }
    return res;
  }

  function placeBombs() {
    bombPositions.clear();
    while (bombPositions.size < BOMBS) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      bombPositions.add(indexKey(r, c));
    }
  }

  function buildGrid() {
    grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r, c,
          isBomb: bombPositions.has(indexKey(r, c)),
          revealed: false,
          flagged: false,
          adj: 0,
          el: null
        });
      }
      grid.push(row);
    }

    // komşu bomba sayıları
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (cell.isBomb) {
          cell.adj = -1;
        } else {
          const neigh = getNeighbors(r, c);
          cell.adj = neigh.reduce((acc, [nr, nc]) => acc + (grid[nr][nc].isBomb ? 1 : 0), 0);
        }
      }
    }
  }

  function buildBoardDOM() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < COLS; c++) {
        const td = document.createElement('td');
        td.style.width  = '14px';
        td.style.height = '14px';
        td.style.backgroundColor = '#C0C0C0';
        td.style.borderTop    = '2px solid #FFFFFF';
        td.style.borderLeft   = '2px solid #FFFFFF';
        td.style.borderRight  = '2px solid #7B7B7B';
        td.style.borderBottom = '2px solid #7B7B7B';
        td.style.textAlign    = 'center';
        td.style.verticalAlign= 'middle';
        td.style.fontFamily   = '"MS Sans Serif", sans-serif';
        td.style.fontSize     = '10px';
        td.style.cursor       = 'pointer';

        const cell = grid[r][c];
        cell.el = td;

        td.addEventListener('click', (e) => {
          e.preventDefault();
          handleReveal(cell);
        });

        td.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          handleFlag(cell);
        });

        tr.appendChild(td);
      }
      boardEl.appendChild(tr);
    }
  }

  function updateStatus() {
    bombsLeftEl.textContent = BOMBS - flagCount;
  }

  function revealAllBombs() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (cell.isBomb) {
          cell.el.textContent = '💣';
          cell.el.style.backgroundColor = '#FF9999';
        }
      }
    }
  }

  function checkWin() {
    const totalCells = ROWS * COLS;
    if (!gameOver && revealedCount === totalCells - BOMBS) {
      gameOver = true;
      stopTimer();
      resetBtn.textContent = '😎 Win!';
    }
  }

  function floodReveal(startCell) {
    const stack = [startCell];
    while (stack.length) {
      const cell = stack.pop();
      if (cell.revealed || cell.flagged) continue;

      cell.revealed = true;
      revealedCount++;
      cell.el.style.border = '1px solid #7B7B7B';
      cell.el.style.backgroundColor = '#D3D3D3';
      cell.el.style.cursor = 'default';

      if (cell.adj > 0) {
        cell.el.textContent = cell.adj;
        const colors = {
          1: '#0000FA',
          2: '#4B802D',
          3: '#DB1300',
          4: '#202081',
          5: '#690400',
          6: '#457A7A',
          7: '#1B1B1B',
          8: '#7A7A7A'
        };
        cell.el.style.color = colors[cell.adj] || '#000';
      } else {
        cell.el.textContent = '';
        const neigh = getNeighbors(cell.r, cell.c);
        neigh.forEach(([nr, nc]) => {
          const ncell = grid[nr][nc];
          if (!ncell.revealed && !ncell.isBomb) {
            stack.push(ncell);
          }
        });
      }
    }
  }

  function handleReveal(cell) {
    if (gameOver || cell.revealed || cell.flagged) return;

    startTimer();

    if (cell.isBomb) {
      gameOver = true;
      cell.el.style.backgroundColor = 'red';
      cell.el.textContent = '💣';
      revealAllBombs();
      resetBtn.textContent = '☹️ Lost';
      stopTimer();
      return;
    }

    floodReveal(cell);
    checkWin();
  }

  function handleFlag(cell) {
    if (gameOver || cell.revealed) return;

    if (cell.flagged) {
      cell.flagged = false;
      flagCount--;
      cell.el.textContent = '';
    } else {
      if (flagCount >= BOMBS) return;
      cell.flagged = true;
      flagCount++;
      cell.el.textContent = '🚩';
    }
    updateStatus();
  }

  function resetGame() {
    stopTimer();
    elapsed = 0;
    timerEl.textContent = '000';
    revealedCount = 0;
    flagCount = 0;
    gameOver = false;
    resetBtn.textContent = '🙂 Reset';

    placeBombs();
    buildGrid();
    buildBoardDOM();
    updateStatus();
  }

  resetBtn.addEventListener('click', resetGame);

  // ilk başlatma
  resetGame();
}
