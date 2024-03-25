import { Chess } from 'chess.js';

export interface Clock {
  initial: number;
  increment: number;
  totalTime: number;
}

export interface Player {
  aiLevel?: number;
  rating: boolean;
  provisional: boolean;
  user?: {
    id: string;
    name: string;
  };
}

export interface Game {
  id: string;
  clock?: Clock;
  perf: string;
  speed: string;
  moves: string;
  source: string;
  rated: boolean;
  status: string;
  winner: string;
  ownerID: string;
  variant: string;
  createdAt: number;
  lastMoveAt: number;
  players: {
    black: Player;
    white: Player;
  };
}

export interface Engine {
  started: number;
  loaded?: boolean;
  ready?: boolean;
  stream?: (data: string) => void;
  send: (
    cmd: string,
    cb?: (response: string) => void,
    stream?: (response: string) => void,
  ) => void;
  stop_moves: () => void;
  get_cue_len: () => number;
  quit: () => void;
}

export class GameDecorator {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  parsePosition(): string {
    const { moves } = this.game;
    const chess = new Chess();
    try {
      chess.loadPgn(moves);
    } catch (e: unknown) {
      console.error(e as Error);
    }
    return chess.fen();
  }

  parseGameClock(): string {
    const { clock } = this.game;
    if (clock?.initial) {
      return `${clock.initial / 60}+${clock.increment}`;
    }
    return '∞';
  }

  parsePlayerName(playerStr: string): string {
    let player: Player;
    if (playerStr === 'black') {
      player = this.game.players.black;
    } else {
      player = this.game.players.white;
    }

    if (player.aiLevel) {
      return `Stockfish nivel ${player.aiLevel}`;
    }
    if (!player.user) {
      return 'Anónimo';
    }
    return player.user.name;
  }

  private parseGameLoser(): string {
    if (this.game.winner === 'black') {
      return 'Las blancas';
    }
    return 'Las negras';
  }

  parseGameStatus(): string {
    const { status } = this.game;
    switch (status) {
      case 'draw':
        return 'Tablas';
      case 'cheat':
        return 'Trampa detectada';
      case 'resign':
        return `${this.parseGameLoser()} abandonaron`;
      case 'outoftime':
        return `${this.parseGameLoser()} agotaron su tiempo`;
      case 'mate':
        return 'Jaque mate';
      case 'timeout':
        return `${this.parseGameLoser()} han dejado la partida`;
      default:
        return 'No definido';
    }
  }

  parseGameWinner(): string {
    const { winner, status } = this.game;
    if (status !== 'draw') {
      if (winner === 'black') {
        return ` • Las negras ganan`;
      }
      return ' • Las blancas ganan';
    }
    return '';
  }

  parseGameMoves(): string {
    const { moves } = this.game;
    const movesArray = moves.split(' ');
    let result = '';

    let turn = 1;
    for (let i = 0; i < movesArray.length && turn < 4; i += 2, turn += 1) {
      const secondMove = movesArray[i + 1] ? movesArray[i + 1] : '';
      result += `${turn}. ${movesArray[i]} ${secondMove} `;
    }

    const numberOfMoves = Math.ceil(movesArray.length / 2);
    if (numberOfMoves > 3) {
      result += `... ${Math.ceil(movesArray.length / 2)} movimientos`;
    }

    return result;
  }

  getGame(): Game {
    return structuredClone(this.game);
  }
}
