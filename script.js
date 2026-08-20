// Gameboard Module
// Only one gameboard should ever exist, so it's wrapped in an IIFE
// (Immediately Invoked Function Expression) — the module pattern.
const Gameboard = (function () {
  let board = ['', '', '', '', '', '', '', '', ''];

  const getBoard = () => board;

  const setMark = (index, mark) => {
    if (board[index] !== '') return false; // spot already taken
    board[index] = mark;
    return true;
  };

  const reset = () => {
    board = ['', '', '', '', '', '', '', '', ''];
  };

  return { getBoard, setMark, reset };
})();

// Player Factory
// A factory function — call it multiple times to make multiple players.
const Player = (name, mark) => {
  return { name, mark };
};

// GameController Module
// Controls the flow of the game (whose turn, win checking, etc).
// Also an IIFE since we only need one instance.
const GameController = (function () {
  let players = [];
  let currentPlayerIndex = 0;
  let gameOver = false;

  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],           // diagonals
  ];

  const start = (name1, name2) => {
    players = [
      Player(name1 || 'Player 1', 'X'),
      Player(name2 || 'Player 2', 'O'),
    ];
    currentPlayerIndex = 0;
    gameOver = false;
    Gameboard.reset();
  };

  const getCurrentPlayer = () => players[currentPlayerIndex];

  const switchPlayerTurn = () => {
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
  };

  const checkWin = () => {
    const board = Gameboard.getBoard();
    return winningCombos.some((combo) => {
      const [a, b, c] = combo;
      return board[a] && board[a] === board[b] && board[a] === board[c];
    });
  };

  const checkTie = () => {
    return Gameboard.getBoard().every((cell) => cell !== '');
  };

  const playRound = (index) => {
    if (gameOver) return { status: 'over' };

    const placed = Gameboard.setMark(index, getCurrentPlayer().mark);
    if (!placed) return { status: 'invalid' }; // spot already taken

    if (checkWin()) {
      gameOver = true;
      return { status: 'win', winner: getCurrentPlayer() };
    }

    if (checkTie()) {
      gameOver = true;
      return { status: 'tie' };
    }

    switchPlayerTurn();
    return { status: 'continue' };
  };

  const isGameOver = () => gameOver;

  return { start, playRound, getCurrentPlayer, isGameOver };
})();

// Display controller module
// Handles all DOM/rendering logic — separate from game logic.
const DisplayController = (function () {
  const boardDiv = document.getElementById('board');
  const resultDisplay = document.getElementById('result-display');
  const playerForm = document.getElementById('player-form');
  const restartBtn = document.getElementById('restart-btn');

  const renderBoard = () => {
    boardDiv.innerHTML = '';
    Gameboard.getBoard().forEach((mark, index) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (mark !== '') cell.classList.add('taken');
      cell.setAttribute('data-index', index);
      cell.textContent = mark;
      boardDiv.appendChild(cell);
    });
  };

  const setResultText = (text) => {
    resultDisplay.textContent = text;
  };

  const handleCellClick = (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;

    const index = Number(cell.getAttribute('data-index'));
    const result = GameController.playRound(index);

    if (result.status === 'invalid' || result.status === 'over') return;

    renderBoard();

    if (result.status === 'win') {
      setResultText(`${result.winner.name} wins!`);
    } else if (result.status === 'tie') {
      setResultText("It's a tie!");
    } else {
      setResultText(`${GameController.getCurrentPlayer().name}'s turn (${GameController.getCurrentPlayer().mark})`);
    }
  };

  const startGame = (name1, name2) => {
    GameController.start(name1, name2);
    renderBoard();
    setResultText(`${GameController.getCurrentPlayer().name}'s turn (${GameController.getCurrentPlayer().mark})`);
  };

  playerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name1 = document.getElementById('player1').value;
    const name2 = document.getElementById('player2').value;
    startGame(name1, name2);
  });

  restartBtn.addEventListener('click', () => {
    startGame(
      document.getElementById('player1').value,
      document.getElementById('player2').value
    );
  });

  boardDiv.addEventListener('click', handleCellClick);

  // Start a default game immediately so the board isn't empty on load
  startGame('Player 1', 'Player 2');

  return { renderBoard };
})();