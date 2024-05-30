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

function getCentipawns(color: string) {
  let latestCp: number = 0;

  return new Promise<number>((resolve) => {
    engine.send(
      'go nodes 10000',
      function onDone() {
        if (color === 'w') {
          latestCp = -latestCp;
        }
        resolve(latestCp);
      },
      function onStream(data) {
        const cpRegex = /score cp (-?\d+)/;
        const match = data.match(cpRegex);
        if (match && match[1]) {
          latestCp = parseFloat(match[1]);
        }
      },
    );
  });
}

async function getAdvantage(color: string) {
  const centipawns = await getCentipawns(color);

  return centipawns / 100;
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

export async function getAccuracy(moves: string[]) {
  const accuracyPerMove: number[] = [];
  const chess = new Chess();
  let cpBefore = 0;

  for (let i = 0; i < moves.length; i += 1) {
    chess.move(moves[i]);
    await send(`position fen ${chess.fen()}`);

    const color = i % 2 === 0 ? 'w' : 'b';
    const cpAfter = await getCentipawns(color);
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
  const advantagePerMove: number[] = [];
  const chess = new Chess();

  for (let i = 0; i < moves.length; i += 1) {
    chess.move(moves[i]);
    await send(`position fen ${chess.fen()}`);

    const color = i % 2 === 0 ? 'w' : 'b';
    advantagePerMove.push(await getAdvantage(color));
  }

  return advantagePerMove;
}
