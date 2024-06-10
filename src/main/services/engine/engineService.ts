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

function getCentipawns(invert: boolean, nodes: number = 50000) {
  let latestScore: number | string = 0;

  return new Promise<number | string>((resolve) => {
    engine.send(
      `go nodes ${nodes}`,
      function onDone() {
        if (invert) {
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

export async function getGameCentipawns(moves: string[]) {
  const centipawnsPerNode: (number | string)[] = [];
  const chess = new Chess();

  for (let i = 0; i < moves.length; i += 1) {
    chess.move(moves[i]);
    await send(`position fen ${chess.fen()}`);

    centipawnsPerNode.push(await getCentipawns(i % 2 === 0));
  }

  return centipawnsPerNode;
}

function calculateWinPercentage(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

function calculateAccuracy(wpBefore: number, wpAfter: number): number {
  const delta = wpBefore - wpAfter;
  const penaltyFactor = delta > 0 ? delta**1.5 : delta;
  return Math.max(
    0,
    Math.min(
      100,
      103.1668 * Math.exp(-0.04354 * penaltyFactor) - 3.1669,
    ),
  );
}

function parseMate(mate: string) {
  return parseInt(mate.substring(1), 10) > 0 ? Infinity : -Infinity;
}

export async function getGameAccuracy(moves: string[]) {
  const centipawnsPerNode: (number | string)[] = await getGameCentipawns(moves);
  const winPercentagePerNode: number[] = centipawnsPerNode.map((cp) =>
    typeof cp === 'string'
      ? calculateWinPercentage(parseMate(cp))
      : calculateWinPercentage(cp),
  );
  winPercentagePerNode.unshift(50);

  let whiteSum = 0;
  let blackSum = 0;
  let whiteCount = 0;
  let blackCount = 0;

  for (let i = 0; i < winPercentagePerNode.length - 1; i += 1) {
    if (i % 2 === 0) {
      whiteSum += calculateAccuracy(
        winPercentagePerNode[i],
        winPercentagePerNode[i + 1],
      );
      whiteCount += 1;
    } else {
      blackSum += calculateAccuracy(
        100-winPercentagePerNode[i],
        100-winPercentagePerNode[i + 1],
      );
      blackCount += 1;
    }
  }

  const whitePlayerAverage = whiteSum / whiteCount;
  const blackPlayerAverage = blackSum / blackCount;

  return { whitePlayerAverage, blackPlayerAverage };
}

export async function getGameAdvantage(moves: string[]) {
  const centipawnsPerNode: (number | string)[] = await getGameCentipawns(moves);
  const advantagePerNode = centipawnsPerNode.map((cp) =>
    typeof cp === 'number' ? cp / 100 : cp,
  );

  return advantagePerNode;
}
