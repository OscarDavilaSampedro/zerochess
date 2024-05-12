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

function getAdvantage() {
  return new Promise<number | null>((resolve) => {
    engine.send('eval', function onDone(data) {
      const evalRegex = /Final evaluation\s+([-+]?\d*\.\d+)/;
      const match = data.match(evalRegex);

      const advantage = match && match[1] ? parseFloat(match[1]) : null;
      resolve(advantage);
    });
  });
}

async function getCentipawns() {
  const advantage = await getAdvantage();

  return advantage ? advantage * 100 : null;
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
  const accuracyPerMove: (number | null)[] = [];
  let cpBefore = await getCentipawns();
  const chess = new Chess();

  for (let i = 0; i < moves.length; i += 1) {
    chess.move(moves[i]);
    await send(`position fen ${chess.fen()}`);

    const cpAfter = await getCentipawns();
    let accuracyPercentage = null;
    if (cpBefore !== null && cpAfter !== null) {
      const wPBefore = calculateWinPercentage(cpBefore);
      const wPAfter = calculateWinPercentage(cpAfter);

      accuracyPercentage = calculateAccPercentage(wPBefore, wPAfter);
    }

    accuracyPerMove.push(accuracyPercentage);
    cpBefore = cpAfter ? -cpAfter : null;
    await send('flip');
  }

  const whitePlayerAccuracy = accuracyPerMove.filter(
    (acc, index) => index % 2 === 0 && acc !== null,
  ) as number[];
  const whitePlayerAverage = calculateAverage(whitePlayerAccuracy);

  const blackPlayerAccuracy = accuracyPerMove.filter(
    (acc, index) => index % 2 !== 0 && acc !== null,
  ) as number[];
  const blackPlayerAverage = calculateAverage(blackPlayerAccuracy);

  return { whitePlayerAverage, blackPlayerAverage };
}

export async function getGameAdvantage(moves: string[]) {
  const advantagePerMove: (number | null)[] = [];
  const chess = new Chess();

  for (let i = 0; i < moves.length; i += 1) {
    chess.move(moves[i]);
    await send(`position fen ${chess.fen()}`);

    advantagePerMove.push(await getAdvantage());
  }

  return advantagePerMove;
}
