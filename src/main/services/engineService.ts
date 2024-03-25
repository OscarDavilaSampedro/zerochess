/* eslint-disable no-await-in-loop */
import loadEngine from './engine/load_engine';
import { Engine } from '../../interfaces';
import { Chess } from 'chess.js';

let engine: Engine;

export async function connectEngine() {
  engine = loadEngine(
    await window.electron.ipcRenderer.joinPath('services/engine/stockfish.js'),
  );
  engine.send('setoption name Use NNUE value true');
}

function getWinPercentage() {
  return new Promise<number>((resolve) => {
    engine.send('eval', function onDone(data) {
      const finalEvaluationRegex = /Final evaluation\s+([-+]?\d*\.\d+)/;
      const match = data.match(finalEvaluationRegex);

      if (match && match[1]) {
        const centipawns = parseFloat(match[1]) * 100;
        const winPercentage = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);

        resolve(winPercentage);
      } else {
        resolve(-1);
      }
    });
  });
}

function postMessage(str: string) {
  return new Promise<void>((resolve) => {
    engine.send(str, () => {
      resolve();
    });
  });
}

export async function getAccuracyPercentage(moves: string[]) {
  const accuracyPerMove: number[] = [];
  const chess = new Chess();

  for (let i = 0; i < moves.length; i += 1) {
    const winPercentBefore = await getWinPercentage();
    chess.move(moves[i]);
    await postMessage(`position fen ${chess.fen()}`);
    const winPercentAfter = await getWinPercentage();

    let accuracyPercentage;
    if (winPercentBefore === -1 || winPercentAfter === -1) {
      accuracyPercentage = -1;
    } else {
      accuracyPercentage = Math.max(
        0,
        Math.min(
          100,
          103.1668 * Math.exp(-0.04354 * (winPercentBefore - winPercentAfter)) - 3.1669,
        ),
      );
    }

    accuracyPerMove.push(accuracyPercentage);
    await postMessage('flip');
  }

  const whitePlayerAccuracy = accuracyPerMove.filter(
    (_, index) => index % 2 === 0,
  );
  const blackPlayerAccuracy = accuracyPerMove.filter(
    (_, index) => index % 2 !== 0,
  );
  return { whitePlayerAccuracy, blackPlayerAccuracy };
}
