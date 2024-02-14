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
    for (let c = 0; c < width; ++c) {
      // create a tile span: <span id="0-0" class="tile"></span>
      let tile = document.createElement("span");
      tile.id = r.toString() + "-" + c.toString(); // id is row#-col# in board
      tile.classList.add("tile");
      document.getElementById("board").appendChild(tile); // adds each tile into the board div
    }
  }
}

// listen for key presses
document.addEventListener("keyup", (e) => {
  if (gameOver) return;
  if ("KeyA" <= e.code && e.code <= "KeyZ") { // check if alphabet char was entered
    if (col < width) {
      let currTile = document.getElementById(row.toString() + "-" + col.toString());
      if (currTile.innerText == "") {
        currTile.innerText = e.code[3];
        col++;
      }
    }
  } else if (e.code == "Backspace") { // check if delete key was pressed
    if (col > 0 && col <= width) {
      col--;
    }
    let currTile = document.getElementById(row.toString() + "-" + col.toString());
    currTile.innerText = "";
  } else if (e.code == "Enter" && col == width) { // check if enter key was pressed and if 5 letters were entered
    update();
  }

  // used up all guesses, gameover
  if (!gameOver && row == height) {
    gameOver = true;
    document.getElementById("answer").innerText = word;
  }
})

// update tile colors
function update() {
  // check if guess is a valid word
  let guess = "";
  document.getElementById("answer").innerText = "";

  for (let c = 0; c < width; ++c) {
    let currTile = document.getElementById(row.toString() + "-" + c.toString());
    let letter = currTile.innerText;
    guess += letter;
  }

  guess = guess.toLowerCase();
  if (!guessList.includes(guess)) {
    document.getElementById("answer").innerText = "Not in word list";
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
      currTile.classList.add("correct"); // change tile color to green
      correct++;
      letterCount[letter]--;
    }

    if (correct == width) {
      gameOver = true;
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
    if (!currTile.classList.contains("correct")) {
      if (word.includes(letter) && letterCount[letter] > 0) { // is it in the word?
        currTile.classList.add("present"); // change tile color to yellow
        letterCount[letter]--;
      } else { // not in the word
        currTile.classList.add("absent"); // change tile color to grey
      }
    }
  }

  row++; // move to next row, next attempt
  col = 0; // start of 0 for new row
}
