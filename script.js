const WORD_LENGTH = 5;
const NUM_OF_GUESSES = 6;
const board = document.querySelector("#board");
const messageContainer = document.querySelector("#message-container");

var gameOver = false;

var word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
var guessedWords = [];

// initialize
window.onload = function() {
  createBoard();
  createKeyboard();
  startInteractions();
}

function createBoard() {
  for (let r = 0; r < NUM_OF_GUESSES; ++r) {
    for (let c = 0; c < WORD_LENGTH; ++c) {
      let tile = document.createElement("div");
      tile.id = r.toString() + "-" + c.toString(); // id is row#-col# in board
      tile.classList.add("board-tile");
      board.appendChild(tile);
    }
  }
}

function createKeyboard() {
  let keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
  ]

  for (let i = 0; i < keyboard.length; ++i) {
    let currRow = keyboard[i];
    let keyboardRow = document.createElement("div");
    keyboardRow.classList.add("keyboard-row");

    for (let j = 0; j < currRow.length; ++j) {
      let keyTile = document.createElement("div");
      let key = currRow[j];
      keyTile.textContent = key;

      if (key == "ENTER") {
        keyTile.dataset.key = "enter";
        keyTile.classList.add("enter-keyboard-tile");
      } else if (key == "⌫") {
        keyTile.dataset.key = "backspace";
        keyTile.classList.add("backspace-keyboard-tile")
      } else if ("A" <= key && key <= "Z") {
        keyTile.dataset.key = key;
        keyTile.classList.add("keyboard-tile");
      }
      keyboardRow.appendChild(keyTile);
    }
    document.getElementById("keyboard").appendChild(keyboardRow);
  }
}

function startInteractions() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keyup", handleKeyPress);
}

function stopInteractions() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keyup", handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches(".keyboard-tile")) {
    pressKey(e.target.dataset.key);
  } else if (e.target.matches(".backspace-keyboard-tile")) {
    deleteKey();
  } else if (e.target.matches(".enter-keyboard-tile")) {
    submitGuess();
  }
}

function handleKeyPress(e) {
  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key.toUpperCase());
  } else if (e.key === "Backspace") {
    deleteKey();
  } else if (e.key === "Enter") {
    submitGuess();
  }
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;
  const tile = board.querySelector(":not([data-letter])");
  tile.dataset.letter = key;
  tile.textContent = key;
  tile.dataset.state = "active";
}

function getActiveTiles() {
  return board.querySelectorAll('[data-state="active"]');
}

function getLetterCounts() {
  // map to store char counts of word, use to change tile colors when there are dup letters
  let letterCounts = {}; // APPLE -> {A:1, P:2, L:1, E:1}
  for (let i = 0; i < word.length; ++i) {
    let l = word[i];
    if (letterCounts[l]) {
      letterCounts[l]++;
    } else {
      letterCounts[l] = 1;
    }
  }
  return letterCounts;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];

  // check if 5 letters were entered
  if (activeTiles.length !== WORD_LENGTH) {
    displayMessage("not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  let guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter.toLowerCase();
  }, "")

  if (!guessList.includes(guess)) { 
    displayMessage("not in word list");
    shakeTiles(activeTiles);
  } else if (guessedWords.includes(guess)) {
    displayMessage("already guessed");
    shakeTiles(activeTiles);
  } else {
    guessedWords.push(guess);
    let letterCounts = getLetterCounts();
    stopInteractions();
    activeTiles.forEach((...args) => { 
      updateCorrectTiles(...args, letterCounts);
    });
    activeTiles.forEach((...args) => {
      updateTiles(...args, guess.toUpperCase(), letterCounts);
    })
  }
}

function updateCorrectTiles(tile, index, array, letterCounts) {
  const letter = tile.dataset.letter;
  const keyTile = keyboard.querySelector(`[data-key="${letter}"i]`)
  tile.style.animationDelay = (index * 0.2) + "s";

  if (word[index] === letter) {
    tile.classList.add("correct-flip");

    setTimeout(() => {
      keyTile.classList.remove("present");
      keyTile.classList.remove("absent");
      keyTile.classList.add("correct");
    }, 1300);

    letterCounts[letter]--;
  }
}

function updateTiles(tile, index, array, guess, letterCounts) {
  const letter = tile.dataset.letter;
  const keyTile = keyboard.querySelector(`[data-key="${letter}"i]`)
  tile.style.animationDelay = (index * 0.2) + "s";

  if (!tile.classList.contains("correct-flip")) {
    if (word.includes(letter) && letterCounts[letter] > 0) {
      tile.classList.add("present-flip");

      setTimeout(() => {
        if (!keyTile.classList.contains("correct")) {
          keyTile.classList.add("present");
        }
      }, 1300);

      letterCounts[letter]--;
    } else {
      tile.classList.add("absent-flip");
      setTimeout(() => {
        if (!keyTile.classList.contains("present") && !keyTile.classList.contains("correct")) {
          keyTile.classList.add("absent");
        }
      }, 1300);
    }
  }

  delete tile.dataset.state;

  if (index === array.length - 1) {
    startInteractions();
    checkGameOver(guess, array);
  }
}

function checkGameOver(guess, tiles) {
  if (guess === word) {
    displayWinMessage(tiles[0].id[0]);
    tiles[4].addEventListener("animationend", () => {
      tiles.forEach(tile => {
        tile.classList.add("dance");
      })
    })
    stopInteractions();
  }
}

function displayWinMessage(row) {
  // diff message if you get the answer on certain guess
  if (row == 0) {
    displayMessage("genius");
  } else if (row == 1) {
    displayMessage("magnificient");
  } else if (row == 2) {  
    displayMessage("impressive");
  } else if (row == 3) {
    displayMessage("splendid");
  } else if (row == 4) {
    displayMessage("great");
  } else if (row == 5) {
    displayMessage("phew");
  }
}

function displayMessage(message, duration = 1000) {
  let toast = document.createElement("div");
  toast.textContent = message;
  toast.classList.add("message");
  messageContainer.prepend(toast);
  if (duration == null) return;
  setTimeout(() => {
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    })
  }, duration);
} 

function shakeTiles(tiles) {
  tiles.forEach(tile => {
    tile.classList.add("shake");
    tile.addEventListener("animationend", () => {
      tile.classList.remove("shake");
    }, { once: true });
  })
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener("animationend", () => {
        tile.classList.remove("dance");
      }, {once: true})
    }, (index * 500) / 5);
  })
}
