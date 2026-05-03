import { Tetraminos } from './Tetraminos';
import { Componente } from './Componente';
import { printScreenGame, random, printScore, printScreenNextPart, tetraminos, printLevel, formatador } from './utils';
import { Rotate } from './rotacao';
import { KeyBoard } from './keyBoard';

import "./style.css";

const gameArea = document.getElementById('tetris');
const canvasGameArea = gameArea.getContext('2d');
const _TETRAMINO = random(tetraminos);
const tetramino = Tetraminos[_TETRAMINO];
canvasGameArea.lineWidth = 0.1;
const keyboard = new KeyBoard(canvasGameArea);
let matriz = printScreenGame(canvasGameArea);

const rotate = new Rotate(tetramino);
const { angle, current, minY, minX } = rotate.execute();

const locationTemp = current.map((location) => {
  const { x, y } = location;
  canvasGameArea.fillStyle = tetramino.color;
  canvasGameArea.fillRect(x, y, 30, 30);
  matriz[(y / 33)][(x / 33)] = 'c';
  return { x, y };
});

printLevel(canvasGameArea, 1);

function update(id, score) {
  console.log(id, scope)
}

const nextPiece = Tetraminos[random(tetraminos)];
nextPiece.update = update;

const componete = new Componente({
  location: locationTemp,
  color: tetramino.color,
  size: tetramino.size,
  type: tetramino.type,
  angle: angle,
  minX,
  minY
}, canvasGameArea, matriz, nextPiece);

printScore(canvasGameArea);
printScreenNextPart(canvasGameArea);
componete.printNextPart();
componete.update = update;

const stop = () => {
  if (componete.isPlaying && !componete.endGame) {
    componete.stop(false);
    componete.isPlaying = false;
  }
};

const start = () => {
  if (!componete.isPlaying && !componete.endGame) {
    componete.timer();
    componete.start();
  }
};

document.addEventListener('keydown', (event) => {
  const keyCode = event.keyCode;

  if (keyCode === 13) {
    keyboard.printKeyBoards('enter', 'keydown');
    start();
  }
  if (componete.isPlaying && !componete.endGame) {

    event.preventDefault();
    if (keyCode === 80) {
      keyboard.printKeyBoards('p', 'keydown');
      stop();
    }

    if (keyCode === 38 || keyCode === 87) {
      keyboard.printKeyBoards('w', 'keydown');
      componete.rotation();
    }

    if (keyCode === 37 || keyCode === 65) {
      keyboard.printKeyBoards('a', 'keydown');
      componete.left();
    }

    if (keyCode === 39 || keyCode === 68) {
      keyboard.printKeyBoards('d', 'keydown');
      componete.right();
    }

    if (keyCode === 40 || keyCode === 83) {
      keyboard.printKeyBoards('s', 'keydown');
      componete.down();
    }

    if (keyCode === 32) {
      keyboard.printKeyBoards('space', 'keydown');
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (componete.isPlaying && !componete.endGame) {
    const keyCode = event.keyCode;
    event.preventDefault();

    if (keyCode === 13) {
      keyboard.printKeyBoards('enter');
      keyboard.printKeyBoards('p');
    }

    if (keyCode === 38 || keyCode === 87) {
      keyboard.printKeyBoards('w');
    }

    if (keyCode === 39 || keyCode === 68) {
      keyboard.printKeyBoards('d');
    }

    if (keyCode === 37 || keyCode === 65) {
      keyboard.printKeyBoards('a');
    }

    if (keyCode === 32) {
      keyboard.printKeyBoards('space');
      componete.downAll();
    }

    if (keyCode === 40 || keyCode === 83) {
      keyboard.printKeyBoards('s');
    }
  }
});