/* eslint-disable no-await-in-loop */
import loadEngine from './helpers/load_engine';
import { Engine } from '../../../interfaces';
import { Chess } from 'chess.js';

let engine: Engine;

function send(str: string) {
  return new Promise<string>((resolve) => {
    engine.send(str, function onDone(data) {
      resolve(data);
    });
  });
}

export async function connectEngine() {
  engine = loadEngine(
    await window.electron.ipcRenderer.joinPath(
      'services/engine/helpers/stockfish.js',
    ),
  );
  await send('setoption name Use NNUE value true');
}

function getCentipawns(color: string, nodes: number = 10000) {
  let latestScore: number | string = 0;

  return new Promise<number | string>((resolve) => {
    engine.send(
      `go nodes ${nodes}`,
      function onDone() {
        if (color === 'w') {
          if (typeof latestScore === 'number') {
            latestScore = -latestScore;
          } else {
            latestScore = `#${-parseInt(latestScore.substring(1), 10)}`;
          }
        }

        resolve(latestScore);
      },
      function onStream(data) {
        const cpRegex = /score cp (-?\d+)/;
        const mateRegex = /score mate (-?\d+)/;

        let match = data.match(mateRegex);
        if (match && match[1]) {
          latestScore = `#${match[1]}`;
        } else {
          match = data.match(cpRegex);
          if (match && match[1]) {
            latestScore = parseFloat(match[1]);
          }
        }
      },
    );
  });
}

function convertCpAfter(cpBefore: number, cpAfter: string): number {
  const cpAfterNumber = parseInt(cpAfter.substring(1), 10);

  return cpBefore + cpAfterNumber * 100;
}

async function getAdvantage(color: string) {
  let centipawns = await getCentipawns(color);
  if (typeof centipawns === 'number') {
    centipawns /= 100;
  }

  return centipawns;
}

function calculateWinPercentage(cp: number) {
  const winPercentage = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);

  return winPercentage;
}

function calculateAccPercentage(wPBefore: number, wPAfter: number) {
  const accuracyPercentage = Math.max(
    0,
    Math.min(
      100,
      103.1668 * Math.exp(-0.04354 * (wPBefore - wPAfter)) - 3.1669,
    ),
  );

  return accuracyPercentage;
}

function calculateAverage(values: number[]) {
  const sum = values.reduce((total, num) => total + num, 0);
  const average = sum / values.length;

  return average;
}

export async function getGameAccuracy(moves: string[]) {
  const accuracyPerMove: number[] = [];
  const chess = new Chess();
  let cpBefore = 0;

  for (let i = 0; i < moves.length; i += 1) {
    chess.move(moves[i]);
    await send(`position fen ${chess.fen()}`);

    const color = i % 2 === 0 ? 'w' : 'b';
    let cpAfter = await getCentipawns(color);
    if (typeof cpAfter === 'string') {
      cpAfter = convertCpAfter(cpBefore, cpAfter);
    }
    const wPAfter = calculateWinPercentage(cpAfter);
    const wPBefore = calculateWinPercentage(cpBefore);

    const accuracyPercentage = calculateAccPercentage(wPBefore, wPAfter);
    accuracyPerMove.push(accuracyPercentage);
    cpBefore = -cpAfter;
    await send('flip');
  }

  const whitePlayerAccuracy = accuracyPerMove.filter(
    (_, index) => index % 2 === 0,
  );
  const whitePlayerAverage = calculateAverage(whitePlayerAccuracy);

  const blackPlayerAccuracy = accuracyPerMove.filter(
    (_, index) => index % 2 !== 0,
  );
  const blackPlayerAverage = calculateAverage(blackPlayerAccuracy);

  return { whitePlayerAverage, blackPlayerAverage };
}

export async function getGameAdvantage(moves: string[]) {
  const advantagePerMove: (number | string)[] = [];
  const chess = new Chess();

  for (let i = 0; i < moves.length; i += 1) {
    chess.move(moves[i]);
    await send(`position fen ${chess.fen()}`);

    const color = i % 2 === 0 ? 'w' : 'b';
    advantagePerMove.push(await getAdvantage(color));
  }

  return advantagePerMove;
}
