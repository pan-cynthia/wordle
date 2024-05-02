const WORD_LENGTH = 5;
const NUM_OF_GUESSES = 6;

const DANCE_ANIMATION_DURATION = 500;
const FLIP_ANIMATION_DURATION = 250;
const MESSAGE_DURATION = 1000;
const MODAL_DELAY = 1500;

const board = document.querySelector(".board");
const keyboard = document.querySelector(".keyboard");
const messageContainer = document.querySelector(".message-container");

const info_modal = document.querySelector("#info-modal");
const stats_modal = document.querySelector("#stats-modal");
const overlay = document.querySelector(".overlay");
const help_btn = document.querySelector("#help-btn");
const stats_btn = document.querySelector("#stats-btn");
const info_close_btn = document.querySelector("#info-close-btn");
const stats_close_btn = document.querySelector("#stats-close-btn");

const offsetFromDate = new Date(2024, 0, 1);
var dayOffset = Math.floor((Date.now() - offsetFromDate) / 1000 / 60 / 60 / 24);
var word = wordList[dayOffset].toUpperCase();

var guessedWords = [];
var currRowIndex = 0;
var gameStatus = "IN_PROGRESS";
var stats = {gamesPlayed: 0, numOfWins: 0, currStreak: 0, maxStreak: 0};
var winMessageCounts = {genius: 0, magnificient: 0, impressive: 0, splendid: 0, great: 0, phew: 0};  
const messageMap = {1: "genius", 2: "magnificient", 3: "impressive", 4: "splendid", 5: "great", 6: "phew"};

document.addEventListener("DOMContentLoaded", () => {
  initLocalStorage();
  createBoard();
  createKeyboard();
  startTimer();
  setInterval(startTimer, 1000);
  refreshPageAt(24, 0, 0);
  loadGameState();
  startInteractions();
  modalInteractions();
});

function startTimer() {
  let start = new Date;
  start.setHours(24, 0, 0, 0);
  let diff = start - Date.now();
  if (diff <= 0) {
    // reset timer once midnight hits
    start = start.getTime() + (24 * 60 * 60 * 1000);
    diff = start - Date.now();
  }
  let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((diff % (1000 * 60)) / 1000);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  document.querySelector("#countdown").textContent = hours + ":" + minutes + ":" + seconds;
}

function refreshPageAt(hour, minute, second) {
  let now = new Date();
  let then = new Date();

  if(now.getHours() > hour || (now.getHours() == hour && now.getMinutes() > minute) ||
     now.getHours() == hour && now.getMinutes() == minute && now.getSeconds() >= second) {
    then.setDate(now.getDate() + 1);
  }
  then.setHours(hour);
  then.setMinutes(minute);
  then.setSeconds(second);

  let timeout = (then.getTime() - now.getTime());
  setTimeout(() => {
    if (gameStatus === "IN_PROGRESS") {
      // reset streak if a game wasn't played today
      stats["currStreak"] = 0;
      localStorage.setItem("stats", JSON.stringify(stats));
    }
    window.location.reload();
  }, timeout);
}

function initLocalStorage() {
  if (!localStorage.getItem("dayOffset")) localStorage.setItem("dayOffset", dayOffset);
  if (!localStorage.getItem("currRowIndex")) localStorage.setItem("currRowIndex", currRowIndex);
  if (!localStorage.getItem("status")) localStorage.setItem("status", gameStatus);
  if (!localStorage.getItem("stats")) localStorage.setItem("stats", JSON.stringify(stats));
  if (!localStorage.getItem("winMessageCounts")) localStorage.setItem("winMessageCounts", JSON.stringify(winMessageCounts));
}

function loadGameState() {
  stats = JSON.parse(localStorage.getItem("stats")) || stats;
  winMessageCounts = JSON.parse(localStorage.getItem("winMessageCounts")) || winMessageCounts;

  let storedDayOffset = localStorage.getItem("dayOffset");
  if (dayOffset != storedDayOffset) {
    // new word/day, don't load previous game state, reset
    resetGameState();
    initLocalStorage();
  } else {
    dayOffset = localStorage.getItem("dayOffset") || dayOffset;
    guessedWords = JSON.parse(localStorage.getItem("guessedWords")) || guessedWords;
    currRowIndex = localStorage.getItem("currRowIndex") || currRowIndex;
    gameStatus = localStorage.getItem("status") || gameStatus;

    let boardState = localStorage.getItem("boardState");
    if (boardState) document.querySelector(".board").innerHTML = boardState;

    let keyboardState = localStorage.getItem("keyboardState");
    if (keyboardState) document.querySelector(".keyboard").innerHTML = keyboardState;

    if (gameStatus === "WIN" || gameStatus === "LOSE") {
      updateStatsModal();
      openModal(stats_modal);
    }
  }
}

function saveGameState() {
  localStorage.setItem("dayOffset", dayOffset);
  localStorage.setItem("guessedWords", JSON.stringify(guessedWords));
  localStorage.setItem("currRowIndex", currRowIndex);
  localStorage.setItem("status", gameStatus);

  let board = document.querySelector(".board");
  localStorage.setItem("boardState", board.innerHTML);

  let keyboard = document.querySelector(".keyboard");
  localStorage.setItem("keyboardState", keyboard.innerHTML);

  localStorage.setItem("stats", JSON.stringify(stats));
  localStorage.setItem("winMessageCounts", JSON.stringify(winMessageCounts));
}

function resetGameState() {
  localStorage.removeItem("dayOffset");
  localStorage.removeItem("guessedWords");
  localStorage.removeItem("currRowIndex");
  localStorage.removeItem("status");
  localStorage.removeItem("boardState");
  localStorage.removeItem("keyboardState");
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
        keyTile.classList.add("enter-keyboard-tile");
      } else if (key == "⌫") {
        keyTile.dataset.key = "backspace";
        keyTile.classList.add("backspace-keyboard-tile");
      } else if ("A" <= key && key <= "Z") {
        keyTile.dataset.key = key;
      }
      keyTile.classList.add("keyboard-tile");
      keyboardRow.appendChild(keyTile);
    }
    document.querySelector(".keyboard").appendChild(keyboardRow);
  }
}

function startInteractions() {
  if (gameStatus === "WIN" || gameStatus === "LOSE") return;
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keyup", handleKeyPress);
  document.querySelector(".keyboard").style.pointerEvents = "auto";
}

function stopInteractions() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keyup", handleKeyPress);
  document.querySelector(".keyboard").style.pointerEvents = "none";
}

function modalInteractions() {
  help_btn.addEventListener("click", () => {
    openModal(info_modal);
  });
  info_close_btn.addEventListener("click", () => { 
    closeModal(info_modal);
  });
  stats_btn.addEventListener("click", () => {
    updateStatsModal();
    openModal(stats_modal);
  });
  stats_close_btn.addEventListener("click", () => {
    closeModal(stats_modal);
  });
  overlay.addEventListener("click", () => {
    closeModal(stats_modal);
    closeModal(info_modal);
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && !info_modal.classList.contains("hidden")) {
      closeModal(info_modal);
    } else if (e.key === "Escape" && !stats_modal.classList.contains("hidden")) {
      closeModal(stats_modal);
    }
  });
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

function updateStatsModal() {
  document.querySelector("#played").textContent = stats["gamesPlayed"];
  const winPercent = (stats["numOfWins"] == 0 && stats["gamesPlayed"] == 0) ? 0 : Math.floor((stats["numOfWins"]/stats["gamesPlayed"]) * 100);
  document.querySelector("#win-percentage").textContent = winPercent;
  document.querySelector("#current-streak").textContent = stats["currStreak"];
  document.querySelector("#max-streak").textContent = stats["maxStreak"];

  // get highest guess count, width of bars will be relative to this count
  const maxGuessCount = Math.max(...Object.values(winMessageCounts));

  document.querySelector("#genius").style.width = (winMessageCounts["genius"] == 0) ? 4 + "%" : (100 * winMessageCounts["genius"] / maxGuessCount) + "%";
  document.querySelector("#genius").textContent = winMessageCounts["genius"];

  document.querySelector("#magnificient").style.width = (winMessageCounts["magnificient"] == 0) ? 4 + "%" : (100 * winMessageCounts["magnificient"] / maxGuessCount) + "%";
  document.querySelector("#magnificient").textContent = winMessageCounts["magnificient"];

  document.querySelector("#impressive").style.width = (winMessageCounts["impressive"] == 0) ? 4 + "%" : (100 * winMessageCounts["impressive"] / maxGuessCount) + "%";
  document.querySelector("#impressive").textContent = winMessageCounts["impressive"];

  document.querySelector("#splendid").style.width = (winMessageCounts["splendid"] == 0) ? 4 + "%" : (100 * winMessageCounts["splendid"] / maxGuessCount) + "%";
  document.querySelector("#splendid").textContent = winMessageCounts["splendid"];

  document.querySelector("#great").style.width = (winMessageCounts["great"] == 0) ? 4 + "%" : (100 * winMessageCounts["great"] / maxGuessCount) + "%";
  document.querySelector("#great").textContent = winMessageCounts["great"];

  document.querySelector("#phew").style.width = (winMessageCounts["phew"] == 0) ? 4 + "%" : (100 * winMessageCounts["phew"] / maxGuessCount) + "%";
  document.querySelector("#phew").textContent = winMessageCounts["phew"];

  if (gameStatus === "WIN") {
    document.querySelector("#" + messageMap[(Number(currRowIndex) + 1)]).style.backgroundColor = "var(--correct)";
  }
}

function handleMouseClick(e) {
  if (e.target.matches(".backspace-keyboard-tile")) {
    deleteKey();
  } else if (e.target.matches(".enter-keyboard-tile")) {
    submitGuess();
  } else if (e.target.matches(".keyboard-tile")) {
    pressKey(e.target.dataset.key);
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
  }, {once: true});
}

function getActiveTiles() {
  return board.querySelectorAll('[data-state="active"]');
}

function getLetterCounts() {
  // map to store char counts of word, use to change tile colors when there are dup letters
  let letterCounts = {}; // APPLE -> {A:1, P:2, L:1, E:1}
  for (let i = 0; i < WORD_LENGTH; ++i) {
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
  if (activeTiles.length !== WORD_LENGTH) {
    displayMessage("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  let guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter.toLowerCase();
  }, "");

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
      }, (index * FLIP_ANIMATION_DURATION) / 2);
    });
    activeTiles.forEach((...args) => {
      updateCorrectTiles(...args, letterCounts);
    });
    activeTiles.forEach((...args) => { 
      updateTiles(...args, guess.toUpperCase(), letterCounts);
    });
  } 
}

function updateCorrectTiles(tile, index, array, letterCounts) {
  const letter = tile.dataset.letter;
  const keyTile = keyboard.querySelector(`[data-key="${letter}"i]`);

  if (word[index] === letter) {
    letterCounts[letter]--;
    tile.addEventListener("transitionend", () => {
      tile.classList.remove("flip");
      if (word[index] === letter) {
        tile.classList.add("correct");
        keyTile.dataset.state = "correct";  
      }
    }, {once: true});
  }
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
        // update keyboard tiles only after all board tiles have finished flipping
        array.forEach(tile => {
          updateKeyboardTiles(tile);
        });
        startInteractions();
        const promise = new Promise(() => {
          checkGameOver(guess, array);
        });
        // save game state only after checkGameOver is fully finished
        promise.then(saveGameState());
      }, {once: true});
    }
  }, {once: true});
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
    stats["currStreak"]++;
    stats["numOfWins"]++;
    stats["gamesPlayed"]++;
    if (stats["currStreak"] > stats["maxStreak"]) stats["maxStreak"] = stats["currStreak"];
    setTimeout(() => {
      updateStatsModal();
      openModal(stats_modal);
    }, MODAL_DELAY);
  } else if (currRowIndex == (NUM_OF_GUESSES - 1)) {
    displayMessage(word, 1300);
    stopInteractions();
    gameStatus = "LOSE";
    stats["currRowIndex"]++;
    stats["currStreak"] = 0;
    stats["gamesPlayed"]++;
    setTimeout(() => {
      updateStatsModal();
      openModal(stats_modal);
    }, MODAL_DELAY);
  } else {
    currRowIndex++;
  }
}

function displayWinMessage(row) {
  // display diff message if you get the answer on certain guess
  if (row == 0) {
    displayMessage("Genius");
    winMessageCounts["genius"]++;
  } else if (row == 1) {
    displayMessage("Magnificient");
    winMessageCounts["magnificient"]++;
  } else if (row == 2) {  
    displayMessage("Impressive");
    winMessageCounts["impressive"]++;
  } else if (row == 3) {
    displayMessage("Splendid");
    winMessageCounts["splendid"]++;
  } else if (row == 4) {
    displayMessage("Great");
    winMessageCounts["great"]++;
  } else if (row == 5) {
    displayMessage("Phew");
    winMessageCounts["phew"]++;
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
    });
  }, MESSAGE_DURATION);
} 

function shakeTiles(tiles) {
  tiles.forEach(tile => {
    tile.classList.add("shake");
    tile.addEventListener("animationend", () => {
      tile.classList.remove("shake");
    }, {once: true});
  });
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
  tiles[4].addEventListener("animationend", () => {
    tiles.forEach(tile => {
      tile.classList.remove("dance");
    });
  });
}
