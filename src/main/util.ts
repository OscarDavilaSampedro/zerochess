import { Game } from '../interfaces';
import { randomUUID } from 'crypto';
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function generateGame(changes: Partial<Game> = {}): Game {
  const defaultGame: Game = {
    id: randomUUID(),
    clock: {
      initial: 300,
      increment: 3,
      totalTime: 420,
    },
    rated: true,
    perf: 'blitz',
    speed: 'blitz',
    source: 'pool',
    winner: 'white',
    status: 'resign',
    moves: 'e4 c5 c3',
    variant: 'standard',
    createdAt: Date.now(),
    lastMoveAt: Date.now(),
    players: {
      black: {},
      white: {},
    },
  };

  const game: Game = { ...defaultGame, ...changes };

  return game;
}
