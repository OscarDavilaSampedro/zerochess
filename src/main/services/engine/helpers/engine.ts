import loadEngine from './stockfish/load_engine';
import { Engine } from '../../../../interfaces';
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
      'services/engine/helpers/stockfish/stockfish.js',
    ),
  );
  await send('setoption name Use NNUE value true');
}

function getCentipawns(invert: boolean, nodes: number = 10000) {
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
