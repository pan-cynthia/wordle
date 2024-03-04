const WIDTH = 5; // length of word
const HEIGHT = 6; // num of guesses

var row = 0; // curr attempt
var col = 0; // curr letter in attempt

var gameOver = false;

var word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
var guessed = [];

// initialize
window.onload = function() {
  createBoard();
  createKeyboard();
  startInteractions();
}

function createBoard() {
  for (let r = 0; r < HEIGHT; ++r) {
    let row = document.createElement("div");
    for (let c = 0; c < WIDTH; ++c) {
      let tile = document.createElement("div");
      tile.id = r.toString() + "-" + c.toString(); // id is row#-col# in board
      tile.classList.add("board-tile");
      row.appendChild(tile);
    }
    document.getElementById("board").appendChild(row);
    row.classList.add("row");
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
      keyTile.innerText = key;

      if (key == "ENTER") {
        keyTile.id = "Enter";
        keyTile.classList.add("enter-keyboard-tile");
      } else if (key == "⌫") {
        keyTile.id = "Backspace";
        keyTile.classList.add("backspace-keyboard-tile")
      } else if ("A" <= key && key <= "Z") {
        keyTile.id = "Key" + key;
        keyTile.classList.add("keyboard-tile"); // "Key" + "A"
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
    pressKey(e.target.id[3]);
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
  if (col > 0 && col <= WIDTH) {
    col--;
  }
  let currTile = document.getElementById(row.toString() + "-" + col.toString());
  currTile.innerText = "";
  currTile.classList.remove("filled-tile");
}

function pressKey(e) {
  if (gameOver) {
    stopInteractions();
    return;
  }
  if (col < WIDTH) {
    let currTile = document.getElementById(row.toString() + "-" + col.toString());
    if (currTile.innerText == "") {
      currTile.innerText = e;
      currTile.classList.add("filled-tile");
      col++;
    }
  }
}

function submitGuess() {
  // check if 5 letters were entered
  if (col != WIDTH) {
    displayMessage("not enough letters");
    shakeTiles();
    return;
  }

  // check if guess is a valid word
  let guess = "";
  for (let c = 0; c < WIDTH; ++c) {
    let currTile = document.getElementById(row.toString() + "-" + c.toString());
    let letter = currTile.innerText;
    guess += letter;
  }
  guess = guess.toLowerCase();

  if (!guessList.includes(guess)) { 
    displayMessage("not in word list");
    shakeTiles();
  } else if (guessed.includes(guess)) {
    displayMessage("already guessed");
    shakeTiles();
  } else {
    guessed.push(guess);
    updateTiles();
  }

   // used up all guesses, gameover, display word
   if (!gameOver && row == HEIGHT) {
    displayMessage(word);
    gameOver = true;
  }
}

function updateTiles() {
  // start processing word and updating tile colors
  let correct = 0;

   // map to store char counts of word, use to change tile colors when there are dup letters
  let letterCount = {}; // APPLE -> {A:1, P:2, L:1, E:1}
  for (let i = 0; i < word.length; ++i) {
    letter = word[i];
    if (letterCount[letter]) {
      letterCount[letter]++;
    } else {
      letterCount[letter] = 1;
    }
  }

  // check if letters are in correct positions first
  for (let c = 0; c < WIDTH; ++c) {
    let currTile = document.getElementById(row.toString() + "-" + c.toString());
    let letter = currTile.innerText;
    currTile.style.animationDelay = (c * 0.2) + "s";

    if (word[c] == letter) { // is it in the correct position?
      currTile.classList.add("correct-flip"); // change tile color to green

      setTimeout(() => {
        let keyTile = document.getElementById("Key" + letter);
        keyTile.classList.remove("present");
        keyTile.classList.add("correct");
      }, 1300);

      correct++;
      letterCount[letter]--;
    }

    if (correct == WIDTH) {
      gameOver = true;
      displayWinMessage(row);
      stopInteractions();
    }
  }

  // iterate again and mark letters that are present but in the wrong positions
  for (let c = 0; c < WIDTH; ++c) {
    let currTile = document.getElementById(row.toString() + "-" + c.toString());
    let letter = currTile.innerText;

    /* solves problem of duplicate letters getting incorrectly highlighted
       ex: if word is APPLE and AAAAA gets entered
           the last 4 A tiles will get colored yellow when they should be grey
    */
    if (!currTile.classList.contains("correct-flip")) {
      if (word.includes(letter) && letterCount[letter] > 0) { // is it in the word?
        currTile.classList.add("present-flip"); // change tile color to yellow

        setTimeout(() => {
          let keyTile = document.getElementById("Key" + letter);
          if (!keyTile.classList.contains("correct")) {
            keyTile.classList.add("present");
          }
        }, 1300);

        letterCount[letter]--;
      } else { // not in the word
        currTile.classList.add("absent-flip"); // change tile color to grey
        setTimeout(() => {
          let keyTile = document.getElementById("Key" + letter);
          if (!keyTile.classList.contains("present") && !keyTile.classList.contains("correct")) {
            keyTile.classList.add("absent");
          }
        }, 1300);
      }
    }
  }

  row++; // move to next row, next attempt
  col = 0; // start of 0 for new row
}

// diff message if you get the answer on certain guess
function displayWinMessage(row) {
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

const messageContainer = document.getElementById("message-container");

function displayMessage(message, duration = 1000) {
  let toast = document.createElement("div");
  toast.innerText = message;
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

function shakeTiles() {
  document.getElementsByClassName("row")[row].style.animation = "shake 0.2s ease forwards";
  setTimeout(() => {
    document.getElementsByClassName("row")[row].style.animation = "";
  }, 1300);
}
