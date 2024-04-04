const WORD_LENGTH = 5;
const NUM_OF_GUESSES = 6;
const board = document.querySelector("#board");
const messageContainer = document.querySelector("#message-container");

var offsetFromDate = new Date(2024, 0, 1);
var dayOffset = Math.floor((Date.now() - offsetFromDate) / 1000 / 60 / 60 / 24);
var word = wordList[dayOffset].toUpperCase();
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
  tile.classList.add("bounce");
  tile.addEventListener("animationend", () => {
    tile.classList.remove("bounce");
  }, { once: true });
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
    displayMessage("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  let guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter.toLowerCase();
  }, "")

  if (!guessList.includes(guess)) { 
    displayMessage("Not in word list");
    shakeTiles(activeTiles);
  } else if (guessedWords.includes(guess)) {
    displayMessage("Already guessed");
    shakeTiles(activeTiles);
  } else {
    guessedWords.push(guess);
    let letterCounts = getLetterCounts();
    stopInteractions();
    activeTiles.forEach((tile, index) => {
      setTimeout(() => {
        tile.classList.add("flip");
      }, (index * 250) / 2)
    })
    activeTiles.forEach((...args) => { updateCorrectTiles(...args, letterCounts) });
    activeTiles.forEach((...args) => { updateTiles(...args, guess.toUpperCase(), letterCounts) });
  } 
}

function updateCorrectTiles(tile, index, array, letterCounts) {
  const letter = tile.dataset.letter;
  const keyTile = keyboard.querySelector(`[data-key="${letter}"i]`);

  tile.addEventListener("transitionend", () => {
    tile.classList.remove("flip");
    if (word[index] === letter) {
      tile.classList.add("correct");
      keyTile.dataset.state = "correct";  
      letterCounts[letter]--;
    }
  })
}

function updateTiles(tile, index, array, guess, letterCounts) {
  const letter = tile.dataset.letter;
  const keyTile = keyboard.querySelector(`[data-key="${letter}"i]`)

  tile.addEventListener("transitionend", () => {
    tile.classList.remove("flip");
    if (!tile.classList.contains("correct")) {
      if (word.includes(letter) && letterCounts[letter] > 0) {
        tile.classList.add("present");
        keyTile.dataset.state = "present";
        letterCounts[letter]--;
      } else {
        tile.classList.add("absent");
        keyTile.dataset.state = "absent";
      }
    }
    delete tile.dataset.state;

    if (index === array.length - 1) {
      tile.addEventListener("transitionend", () => {
        // update keyboard tiles after board tiles have finished flipping
        array.forEach(tile => { updateKeyboardTiles(tile) });
        startInteractions();
        checkGameOver(guess, array);
      }, {once: true})
    }
  }, {once: true})
}

function updateKeyboardTiles(tile) {
  const letter = tile.dataset.letter;
  const keyTile = keyboard.querySelector(`[data-key="${letter}"i]`)

  if (keyTile.dataset.state == "correct") {
    keyTile.classList.remove("present");
    keyTile.classList.remove("absent");
    keyTile.classList.add("correct");
  } else if (keyTile.dataset.state == "present") {
    if (!keyTile.classList.contains("correct")) {
      keyTile.classList.add("present");
    }
  } else if (keyTile.dataset.state == "absent") {
    if (!keyTile.classList.contains("present") && !keyTile.classList.contains("correct")) {
      keyTile.classList.add("absent");
    }
  }
}

function checkGameOver(guess, tiles) {
  if (guess === word) {
    displayWinMessage(tiles[0].id[0]);
    danceTiles(tiles);
    stopInteractions();
  } else if (tiles[0].id[0] == (NUM_OF_GUESSES - 1)) {
    displayMessage(word, 1300);
    stopInteractions();
  }
}

function displayWinMessage(row) {
  // diff message if you get the answer on certain guess
  if (row == 0) {
    displayMessage("Genius");
  } else if (row == 1) {
    displayMessage("Magnificient");
  } else if (row == 2) {  
    displayMessage("Impressive");
  } else if (row == 3) {
    displayMessage("Splendid");
  } else if (row == 4) {
    displayMessage("Great");
  } else if (row == 5) {
    displayMessage("Phew");
  }
}

function displayMessage(message) {
  let toast = document.createElement("div");
  toast.textContent = message;
  toast.classList.add("message");
  messageContainer.prepend(toast);
  if (message == word) return;
  setTimeout(() => {
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    })
  }, 1000);
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
    }, (index * 500) / 5)
  })
  tiles[4].addEventListener("animationend", () => {
    tiles.forEach(tile => {
      tile.classList.remove("dance");
    })
  })
}
