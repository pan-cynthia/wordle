const WORD_LENGTH = 5;
const NUM_OF_GUESSES = 6;
const board = document.querySelector("#board");
const messageContainer = document.querySelector("#message-container");

const instructions_modal = document.querySelector("#instructions-modal");
const stats_modal = document.querySelector("#stats-modal");
const overlay = document.querySelector(".overlay");
const help_btn = document.querySelector("#help-btn");
const stats_btn = document.querySelector("#stats-btn");
const instructions_close_btn = document.querySelector("#instructions-close-btn");
const stats_close_btn = document.querySelector("#stats-close-btn");

var offsetFromDate = new Date(2024, 0, 1);
var dayOffset = Math.floor((Date.now() - offsetFromDate) / 1000 / 60 / 60 / 24);
var word = wordList[dayOffset].toUpperCase();
var guessedWords = [];
var currRowIndex = 0;
var gameStatus = "IN_PROGRESS";
var gamesPlayed = 0;
var numOfWins = 0;
var currStreak = 0;
var maxStreak = 0;
var genius = 0;
var magnificient = 0;
var impressive = 0;
var splendid = 0;
var great = 0;
var phew = 0;

// initialize
window.onload = function() {
  initLocalStorage();
  createBoard();
  createKeyboard();
  loadGameState();
  startInteractions();
  modalInteractions();
}

function initLocalStorage() {
  const storedDayOffset = localStorage.getItem("dayOffset");
  if (!storedDayOffset) localStorage.setItem("dayOffset", dayOffset);

  const storedCurrRowIndex = localStorage.getItem("currRowIndex");
  if (!storedCurrRowIndex) localStorage.setItem("currRowIndex", currRowIndex);

  const storedGameStatus = localStorage.getItem("status");
  if (!storedGameStatus) localStorage.setItem("status", gameStatus);

  const storedGamesPlayed = localStorage.getItem("gamesPlayed");
  if (!storedGamesPlayed) localStorage.setItem("gamesPlayed", gamesPlayed);

  const storedNumOfWins = localStorage.getItem("numOfWins", numOfWins);
  if (!storedNumOfWins) localStorage.setItem("numOfWins", numOfWins);

  const storedCurrStreak = localStorage.getItem("currStreak", currStreak);
  if (!storedCurrStreak) localStorage.setItem("currStreak", currStreak);

  const storedMaxStreak = localStorage.getItem("maxStreak", maxStreak);
  if (!storedMaxStreak) localStorage.setItem("maxStreak", maxStreak);

  const storedGenius = localStorage.getItem("genius");
  if (!storedGenius) localStorage.setItem("genius", genius);

  const storedMagnificient = localStorage.getItem("magnficient");
  if (!storedMagnificient) localStorage.setItem("magnificient", magnificient);

  const storedImpressive = localStorage.getItem("impressive");
  if (!storedImpressive) localStorage.setItem("impressive", impressive);

  const storedSplendid = localStorage.getItem("splendid");
  if (!storedSplendid) localStorage.setItem("splendid", splendid);

  const storedGreat = localStorage.getItem("great");
  if (!storedGreat) localStorage.setItem("great", great);

  const storedPhew = localStorage.getItem("phew");
  if (!storedPhew) localStorage.setItem("phew", phew);
}

function resetGameState() {
  localStorage.removeItem("dayOffset");
  localStorage.removeItem("guessedWords");
  localStorage.removeItem("currRowIndex");
  localStorage.removeItem("status");
  localStorage.removeItem("boardState");
  localStorage.removeItem("keyboardState");
}

function saveGameState() {
  localStorage.setItem("guessedWords", JSON.stringify(guessedWords));
  localStorage.setItem("currRowIndex", currRowIndex);
  localStorage.setItem("status", gameStatus);

  let board = document.getElementById("board");
  localStorage.setItem("boardState", board.innerHTML);

  let keyboard = document.getElementById("keyboard");
  localStorage.setItem("keyboardState", keyboard.innerHTML);

  localStorage.setItem("gamesPlayed", gamesPlayed);
  localStorage.setItem("numOfWins", numOfWins);
  localStorage.setItem("currStreak", currStreak);
  localStorage.setItem("maxStreak", maxStreak);

  localStorage.setItem("genius", genius);
  localStorage.setItem("magnificient", magnificient);
  localStorage.setItem("impressive", impressive);
  localStorage.setItem("splendid", splendid);
  localStorage.setItem("great", great);
  localStorage.setItem("phew", phew);
}

function loadGameState() {
  var storedDayOffset = localStorage.getItem("dayOffset");
  // new word/day, don't load previous game state, reset
  if (dayOffset != storedDayOffset) {
    resetGameState();
    return;
  }
  
  guessedWords = JSON.parse(localStorage.getItem("guessedWords")) || guessedWords;
  currRowIndex = localStorage.getItem("currRowIndex") || currRowIndex;
  gameStatus = localStorage.getItem("status") || gameStatus;

  let boardState = localStorage.getItem("boardState");
  if (boardState) document.getElementById("board").innerHTML = boardState;

  let keyboardState = localStorage.getItem("keyboardState");
  if (keyboardState) document.getElementById("keyboard").innerHTML = keyboardState;

  gamesPlayed = localStorage.getItem("gamesPlayed") || gamesPlayed;
  numOfWins = localStorage.getItem("numOfWins") || numOfWins;
  currStreak = localStorage.getItem("currStreak") || currStreak;
  maxStreak = localStorage.getItem("maxStreak") || maxStreak;

  genius = localStorage.getItem("genius") || genius;
  magnificient = localStorage.getItem("magnficient") || magnificient;
  impressive = localStorage.getItem("impressive") || impressive;
  splendid = localStorage.getItem("splendid") || splendid;
  great = localStorage.getItem("great") || great;
  phew = localStorage.getItem("phew") || phew;

}

function updateStatsModal() {
  document.querySelector("#played").textContent = gamesPlayed;
  const winPercent = (numOfWins == 0 && gamesPlayed == 0) ? 0 : Math.floor((numOfWins/gamesPlayed) * 100);
  document.querySelector("#win-percentage").textContent = winPercent;
  document.querySelector("#current-streak").textContent = currStreak;
  document.querySelector("#max-streak").textContent = maxStreak;
}

function createBoard() {
  for (let r = 0; r < NUM_OF_GUESSES; ++r) {
    for (let c = 0; c < WORD_LENGTH; ++c) {
      let tile = document.createElement("div");
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
  if (gameStatus === "WIN" || gameStatus === "LOSE") return;
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keyup", handleKeyPress);
}

function stopInteractions() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keyup", handleKeyPress);
}

function modalInteractions() {
  help_btn.addEventListener("click", function() {
    openModal(instructions_modal);
  });
  instructions_close_btn.addEventListener("click", function() {
    closeModal(instructions_modal);
  });
  stats_btn.addEventListener("click", function() {
    updateStatsModal();
    openModal(stats_modal);
  });
  stats_close_btn.addEventListener("click", function() {
    closeModal(stats_modal);
  })
  overlay.addEventListener("click", function() {
    closeModal(stats_modal);
    closeModal(instructions_modal);
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && !instructions_modal.classList.contains("hidden")) {
      closeModal(instructions_modal);
    } else if (e.key === "Escape" && !stats_modal.classList.contains("hidden")) {
      closeModal(stats_modal);
    }
  })
}

function openModal(modal) {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
  stopInteractions();
}

function closeModal(modal) {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
  startInteractions();
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
        const promise = new Promise(() => {checkGameOver(guess, array)});
        // save game state after checkGameOver is fully finished
        promise.then(saveGameState());
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
    displayWinMessage(currRowIndex);
    danceTiles(tiles);
    stopInteractions();
    gameStatus = "WIN";
    currStreak++;
    numOfWins++;
    gamesPlayed++;
  if (currStreak > maxStreak) maxStreak = currStreak;
  } else if (currRowIndex == (NUM_OF_GUESSES - 1)) {
    displayMessage(word, 1300);
    stopInteractions();
    gameStatus = "LOSE";
    currRowIndex++;
    currStreak = 0;
    gamesPlayed++;
  } else {
    currRowIndex++;
  }
}

function displayWinMessage(row) {
  // diff message if you get the answer on certain guess
  if (row == 0) {
    displayMessage("Genius");
    genius++;
  } else if (row == 1) {
    displayMessage("Magnificient");
    magnificient++;
  } else if (row == 2) {  
    displayMessage("Impressive");
    impressive++;
  } else if (row == 3) {
    displayMessage("Splendid");
    splendid++;
  } else if (row == 4) {
    displayMessage("Great");
    great++;
  } else if (row == 5) {
    displayMessage("Phew");
    phew++;
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
