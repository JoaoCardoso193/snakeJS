let gridSize = 20;
let gridWidth;
let gridHeight;
let snake;
let game;

let snakeColors = ["palevioletred", "orange", "red", "palegreen", "aqua"];

let snakeColor = snakeColors[0];

const setRandomSnakeColor = () => {
  snakeColor = snakeColors[Math.floor(Math.random() * snakeColors.length)];
};
function setup() {
  createCanvas(640, 480);
  frameRate(20);
  gridWidth = width / gridSize;
  gridHeight = height / gridSize;
  snake = new Snake();
  game = new Game(snake);
  fetchHighScore();
}

function draw() {
  background("navy");

  if (!game.finished && !game.paused) {
    snake.move();
  }
  snake.draw();
  game.draw();

  if (game.snakeHitBall(snake.x, snake.y)) {
    game.recordHit();
    snake.grow();
  }

  if (snake.snakeHitItself()) {
    game.finish();
    saveHighScore(game.score);
  }
}

function keyPressed() {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
    if (snake.canChangeDirectionTo(key) && !game.paused) {
      snake.direction = key;
    }
  } else if (key === "r" || key === "R") {
    snake = new Snake();
    game = new Game(snake);
  } else if (key === "q" || key === "Q") {
    noLoop();
  } else if (key === "p" || key === "P") {
    game.paused = !game.paused;
  }
}

function fetchHighScore() {
  const highScore = localStorage.getItem("highScore") || 0;
  document.getElementById("high-score").textContent = highScore;
}

function saveHighScore(score) {
  const highScore = localStorage.getItem("highScore") || 0;
  if (score > highScore) {
    localStorage.setItem("highScore", score);
    document.getElementById("high-score").textContent = score;
  }
}

class Snake {
  constructor() {
    this.positions = [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ];
    this.direction = "ArrowDown";
    this.growing = false;
  }

  draw() {
    fill(snakeColor);
    for (let position of this.positions) {
      rect(
        position[0] * gridSize,
        position[1] * gridSize,
        gridSize - 1,
        gridSize - 1
      );
    }
  }

  move() {
    if (!this.growing) {
      this.positions.shift();
    }

    let newHead;
    switch (this.direction) {
      case "ArrowDown":
        newHead = this.newCoords(this.head[0], this.head[1] + 1);
        break;
      case "ArrowUp":
        newHead = this.newCoords(this.head[0], this.head[1] - 1);
        break;
      case "ArrowLeft":
        newHead = this.newCoords(this.head[0] - 1, this.head[1]);
        break;
      case "ArrowRight":
        newHead = this.newCoords(this.head[0] + 1, this.head[1]);
        break;
    }
    this.positions.push(newHead);
    this.growing = false;
  }

  canChangeDirectionTo(newDirection) {
    switch (this.direction) {
      case "ArrowUp":
        return newDirection !== "ArrowDown";
      case "ArrowDown":
        return newDirection !== "ArrowUp";
      case "ArrowLeft":
        return newDirection !== "ArrowRight";
      case "ArrowRight":
        return newDirection !== "ArrowLeft";
    }
  }

  get x() {
    return this.head[0];
  }

  get y() {
    return this.head[1];
  }

  grow() {
    this.growing = true;
  }

  snakeHitItself() {
    let uniquePositions = new Set(this.positions.map((pos) => pos.toString()));
    return uniquePositions.size !== this.positions.length;
  }

  newCoords(x, y) {
    return [this.wrap(x, gridWidth), this.wrap(y, gridHeight)];
  }

  wrap(coord, max) {
    if (coord < 0) {
      return max - 1;
    } else if (coord >= max) {
      return 0;
    } else {
      return coord;
    }
  }

  get head() {
    return this.positions[this.positions.length - 1];
  }
}

class Game {
  constructor(snake) {
    this.snake = snake;
    this.score = 0;
    let initialCoords = this.drawBall();
    this.ballX = initialCoords[0];
    this.ballY = initialCoords[1];
    this.finished = false;
    this.paused = false;
  }

  drawBall() {
    let availableCoords = [];
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        availableCoords.push([x, y]);
      }
    }

    let selected = availableCoords.filter(
      (coord) => !this.snake.positions.includes(coord.toString())
    );
    return random(selected);
  }

  draw() {
    if (!this.finished) {
      fill("yellow");
      rect(this.ballX * gridSize, this.ballY * gridSize, gridSize, gridSize);
    }
    fill("white");
    textSize(25);
    text(this.textMessage(), 10, 30);
  }

  snakeHitBall(x, y) {
    return this.ballX === x && this.ballY === y;
  }

  recordHit() {
    this.score += 1;
    let ballCoords = this.drawBall();
    this.ballX = ballCoords[0];
    this.ballY = ballCoords[1];
    setRandomSnakeColor();
  }

  finish() {
    this.finished = true;
  }

  textMessage() {
    if (this.finished) {
      return `Game over, score: ${this.score}. Press 'R' to restart, 'Q' to quit.`;
    } else if (this.paused) {
      return `Game paused, score: ${this.score}. Press 'P' to resume.`;
    } else {
      return `Score: ${this.score}`;
    }
  }
}
