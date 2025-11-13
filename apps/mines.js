// ============================================
// 💣 Minesweeper — OceanOS App (Modüler)
// ============================================

(function() {

    function openMines() {
        const win = WindowManager.createWindow({
            appName: "mines",
            title: "Minesweeper",
            width: 260,
            contentURL: "/templates/mines.html"
        });

        // HTML yüklenince oyunu başlat
        setTimeout(() => initMines(win), 40);
    }


    // ===============================
    // STATE
    // ===============================
    let size = 9;
    const sizeLookup = {
        9:  { totalBombs: 10, width: "200px" },
        16: { totalBombs: 40, width: "360px" },
        30: { totalBombs: 160, width: "650px" }
    };

    let board = [];
    let bombCount = 0;
    let elapsed = 0;
    let timer = null;
    let gameOver = false;
    let win = false;


    // ===============================
    // MAIN INIT
    // ===============================
    function initMines(winWrapper) {

        const root = winWrapper.querySelector("#minesRoot");

        root.innerHTML = `
            <div id="mine-status" style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:6px;
                padding:4px;
                background:#BFBFBF;
                border-top:2px solid #7B7B7B;
                border-left:2px solid #7B7B7B;
                border-right:2px solid #FFFFFF;
                border-bottom:2px solid #FFFFFF;
                font-family:'MS Sans Serif', sans-serif;
            ">
                <div>💣 <span id="bombs-left"></span></div>
                <button id="mine-reset" class="button" style="min-width:20px;">🙂 Reset</button>
                <div>⏱ <span id="mine-timer">000</span>s</div>
            </div>

            <div style="display:flex; gap:6px; margin-bottom:8px;">
                <button class="button mine-diff" data-size="9">Easy</button>
                <button class="button mine-diff" data-size="16">Medium</button>
                <button class="button mine-diff" data-size="30">Hard</button>
            </div>

            <table id="mine-board" style="border-collapse:collapse; margin:auto;"></table>
        `;

        // Eventler
        root.querySelector("#mine-reset").addEventListener("click", () => resetGame(root));
        root.querySelectorAll(".mine-diff").forEach(btn => {
            btn.addEventListener("click", () => {
                size = parseInt(btn.dataset.size);
                resetGame(root);
            });
        });

        resetGame(root);
    }


    // ===============================
    // OYUN RESET
    // ===============================
    function resetGame(root) {

        stopTimer();
        elapsed = 0;
        gameOver = false;
        win = false;

        root.querySelector("#mine-timer").textContent = "000";

        buildBoardState();
        buildBoardDOM(root);
        updateStatus(root);
    }


    // ===============================
    // BOARD STATE
    // ===============================
    function buildBoardState() {

        board = Array(size).fill(null).map(() => Array(size).fill(null));

        // Hücre nesneleri
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                board[r][c] = {
                    r, c,
                    isBomb: false,
                    revealed: false,
                    flagged: false,
                    adj: 0
                };
            }
        }

        // Bomb yerleşimi
        bombCount = sizeLookup[size].totalBombs;
        let bombsPlaced = 0;

        while (bombsPlaced < bombCount) {
            let r = Math.floor(Math.random() * size);
            let c = Math.floor(Math.random() * size);
            if (!board[r][c].isBomb) {
                board[r][c].isBomb = true;
                bombsPlaced++;
            }
        }

        // Adjacent sayıları
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c].isBomb) {
                    board[r][c].adj = -1;
                } else {
                    board[r][c].adj = countAdj(r, c);
                }
            }
        }
    }


    // ===============================
    // UI — BOARD DOM
    // ===============================
    function buildBoardDOM(root) {

        const boardEl = root.querySelector("#mine-board");
        boardEl.innerHTML = "";
        boardEl.style.width = sizeLookup[size].width;

        for (let r = 0; r < size; r++) {

            const tr = document.createElement("tr");

            for (let c = 0; c < size; c++) {

                const td = document.createElement("td");

                td.style.width = "16px";
                td.style.height = "16px";
                td.style.backgroundColor = "#C0C0C0";
                td.style.borderTop = "2px solid #FFFFFF";
                td.style.borderLeft = "2px solid #FFFFFF";
                td.style.borderRight = "2px solid #7B7B7B";
                td.style.borderBottom = "2px solid #7B7B7B";
                td.style.textAlign = "center";
                td.style.fontSize = "10px";
                td.style.fontFamily = '"MS Sans Serif"';

                td.dataset.r = r;
                td.dataset.c = c;

                td.addEventListener("click", e => handleLeftClick(e, root));
                td.addEventListener("contextmenu", e => handleRightClick(e, root));

                tr.appendChild(td);
            }

            boardEl.appendChild(tr);
        }
    }


    // ===============================
    // EVENT HANDLERS
    // ===============================
    function handleLeftClick(e, root) {

        if (gameOver) return;

        const r = parseInt(e.target.dataset.r);
        const c = parseInt(e.target.dataset.c);
        const cell = board[r][c];

        startTimer(root);

        if (cell.isBomb) {
            lose(root, e.target);
            return;
        }

        revealCell(r, c);
        checkWinCondition(root);
    }

    function handleRightClick(e, root) {
        e.preventDefault();
        if (gameOver) return;

        const r = parseInt(e.target.dataset.r);
        const c = parseInt(e.target.dataset.c);
        const cell = board[r][c];

        if (cell.revealed) return;

        cell.flagged = !cell.flagged;

        const td = e.target;
        td.textContent = cell.flagged ? "🚩" : "";

        updateStatus(root);
    }


    // ===============================
    // OYUN MANTIĞI
    // ===============================
    function revealCell(r, c) {

        const cell = board[r][c];
        const td = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);

        if (cell.revealed || cell.flagged) return;

        cell.revealed = true;

        td.style.backgroundColor = "#D3D3D3";
        td.style.border = "1px solid #7B7B7B";

        if (cell.adj > 0) {
            td.textContent = cell.adj;
            td.style.color = getAdjColor(cell.adj);
        } else {
            td.textContent = "";
            // flood fill
            getNeighbors(r, c).forEach(([nr, nc]) => revealCell(nr, nc));
        }
    }


    function lose(root, td) {

        gameOver = true;
        td.style.backgroundColor = "red";
        td.textContent = "💣";

        revealAllBombs();

        root.querySelector("#mine-reset").textContent = "☹️ Lost";
        stopTimer();
    }


    function revealAllBombs() {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c].isBomb) {
                    const td = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
                    td.textContent = "💣";
                }
            }
        }
    }


    // ===============================
    // WIN CHECK
    // ===============================
    function checkWinCondition(root) {
        let revealed = 0;

        board.forEach(row =>
            row.forEach(cell => revealed += (cell.revealed ? 1 : 0))
        );

        if (revealed === size * size - sizeLookup[size].totalBombs) {
            gameOver = true;
            win = true;
            stopTimer();
            root.querySelector("#mine-reset").textContent = "😎 Win!";
        }
    }


    // ===============================
    // YARDIMCI FONKSİYONLAR
    // ===============================

    function startTimer(root) {
        if (timer) return;

        timer = setInterval(() => {
            elapsed++;
            root.querySelector("#mine-timer").textContent =
                String(elapsed).padStart(3, "0");
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
        timer = null;
    }

    function updateStatus(root) {
        const flags = board.flat().filter(c => c.flagged).length;
        root.querySelector("#bombs-left").textContent =
            sizeLookup[size].totalBombs - flags;
    }

    function countAdj(r, c) {
        return getNeighbors(r, c)
            .filter(([nr, nc]) => board[nr][nc].isBomb)
            .length;
    }

    function getNeighbors(r, c) {
        const offsets = [-1, 0, 1];
        const list = [];

        offsets.forEach(dr => {
            offsets.forEach(dc => {
                if (dr === 0 && dc === 0) return;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                    list.push([nr, nc]);
                }
            });
        });

        return list;
    }

    function getAdjColor(n) {
        return [
            "",
            "#0000FA",
            "#4B802D",
            "#DB1300",
            "#202081",
            "#690400",
            "#457A7A",
            "#1B1B1B",
            "#7A7A7A"
        ][n];
    }


    // Global App API
    window.MinesApp = { open: openMines };

})();
