var width = 5; // length of word
var height = 6; // num of guesses

var row = 0; // curr attempt
var col = 0; // curr letter in attempt

var gameOver = false;
var word = "APPLE";

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
    row++; // move to next row, next attempt
    col = 0; // start of 0 for new row
  }

  // used up all guesses, gameover
  if (!gameOver && row == height) {
    gameOver = true;
  }
})

// update tile colors
function update() {
  let correct = 0;
  for (let c = 0; c < width; ++c) {
    let currTile = document.getElementById(row.toString() + "-" + c.toString());
    let letter = currTile.innerText;

    if (word[c] == letter) { // is it in the correct position?
      currTile.classList.add("correct");
      correct++;
    } else if (word.includes(letter)) { // is it in the word?
      currTile.classList.add("present");
    } else { // not in the word
      currTile.classList.add("absent");
    }

    if (correct == width) {
      gameOver = true;
    }
  }
}