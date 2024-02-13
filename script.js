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
