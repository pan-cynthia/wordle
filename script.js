var width = 5; // length of word
var height = 6; // num of guesses

var row = 0; // curr attempt
var col = 0; // curr letter in attempt

var gameOver = false;

var word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();

window.onload = function() {
  initialize();
}

function initialize() {
  // create board (6x5)
  for (let r = 0; r < height; ++r) {
    let row = document.createElement("div");
    for (let c = 0; c < width; ++c) {
      // create a tile span: <span id="0-0" class="tile"></span>
      let tile = document.createElement("span");
      tile.id = r.toString() + "-" + c.toString(); // id is row#-col# in board
      tile.classList.add("tile");
      row.appendChild(tile);
    }
    document.getElementById("board").appendChild(row);
    row.classList.add("row");
  }

  // create keyboard
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
        keyTile.classList.add("enter-key-tile");
      } else if (key == "⌫") {
        keyTile.id = "Backspace";
        keyTile.classList.add("backspace-key-tile")
      } else if ("A" <= key && key <= "Z") {
        keyTile.id = "Key" + key;
        keyTile.classList.add("key-tile"); // "Key" + "A"
      }

      keyTile.addEventListener("click", processKey);
      keyboardRow.appendChild(keyTile);
    }
    document.body.appendChild(keyboardRow);
  }
}

// listen for key presses
document.addEventListener("keyup", (e) => {
  processInput(e);
})

function processKey() {
  let e = {"code" : this.id};
  processInput(e);
}

function processInput(e) {
  if (gameOver) return;
  if ("KeyA" <= e.code && e.code <= "KeyZ") { // check if alphabet char was entered
    if (col < width) {
      let currTile = document.getElementById(row.toString() + "-" + col.toString());
      if (currTile.innerText == "") {
        currTile.innerText = e.code[3];
        currTile.classList.add("filled-tile");
        col++;
      }
    }
  } else if (e.code == "Backspace") { // check if delete key was pressed
    if (col > 0 && col <= width) {
      col--;
    }
    let currTile = document.getElementById(row.toString() + "-" + col.toString());
    currTile.innerText = "";
    currTile.classList.remove("filled-tile");
  } else if (e.code == "Enter" && col == width) { // check if enter key was pressed and if 5 letters were entered
    update();
  } else if (e.code == "Enter" && col != width) {
    displayMessage("not enough letters");
  }

  // used up all guesses, gameover, display word
  if (!gameOver && row == height) {
    displayMessage(word);
    gameOver = true;
  }
}

// update tile colors
function update() {
  // check if guess is a valid word
  let guess = "";

  for (let c = 0; c < width; ++c) {
    let currTile = document.getElementById(row.toString() + "-" + c.toString());
    let letter = currTile.innerText;
    guess += letter;
  }

  guess = guess.toLowerCase();
  if (!guessList.includes(guess)) {
    displayMessage("not in word list");
    return;
  }

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
  for (let c = 0; c < width; ++c) {
    let currTile = document.getElementById(row.toString() + "-" + c.toString());
    let letter = currTile.innerText;

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

    if (correct == width) {
      gameOver = true;
      displayEndMessage(row);
    }
  }

  // iterate again and mark letters that are present but in the wrong positions
  for (let c = 0; c < width; ++c) {
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
          if (!keyTile.classList.contains("present")) {
            keyTile.classList.add("absent");
          }
        }, 1300);
      }
    }
  }

  row++; // move to next row, next attempt
  col = 0; // start of 0 for new row
}

function displayMessage(message) {
  let toast = document.getElementById("message-toast");
  toast.innerText = message;
  toast.classList.add("show");
  if (message != word) {
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }
} 

// diff message if you get the answer on certain guess
function displayEndMessage(row) {
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
