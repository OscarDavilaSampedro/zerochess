import loadEngine from './engine/load_engine';
import { Engine } from '../../interfaces';

let engine: Engine;

export async function connectEngine() {
  engine = loadEngine(
    await window.electron.ipcRenderer.joinPath('services/engine/stockfish.js'),
  );
  engine.send('setoption name Use NNUE value true');
}

export function postMessage(str: string) {
  console.log(`Sending: ${str}`);
  engine.send(
    str,
    function onDone(data) {
      console.log('DONE:', data);
    },
    function onStream(data) {
      console.log('STREAMING:', data);
    },
  );
}
