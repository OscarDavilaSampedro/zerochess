import { Chess } from 'chess.js';

export interface Clock {
  initial: number;
  increment: number;
  totalTime: number;
}

export interface Player {
  rating?: number;
  aiLevel?: number;
  ratingDiff?: number;
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
  variant: string;
  createdAt: number;
  lastMoveAt: number;
  players: {
    black: Player;
    white: Player;
  };
  analysis?: { [key: string]: any };
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
    const chess = new Chess();

    try {
      chess.loadPgn(this.game.moves);
    } catch (e: unknown) {
      console.error(e as Error);
    }

    return chess.fen();
  }

  parseGameClock(): string {
    const { clock } = this.game;
    let result = '∞';

    if (clock?.initial) {
      result = `${clock.initial / 60}+${clock.increment}`;
    }

    return result;
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
    if (!player.user || !player.user.id) {
      return 'Anónimo';
    }

    return player.user!.name;
  }

  private parseGameLoser(): string {
    let result = 'Las negras';

    if (this.game.winner === 'black') {
      result = 'Las blancas';
    }

    return result;
  }

  parseGameStatus(): string {
    switch (this.game.status) {
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
    if (status === 'draw') {
      return '';
    }

    return winner === 'black' ? ' • Las negras ganan' : ' • Las blancas ganan';
  }

  parseGameMoves(): string {
    const movesArray = this.game.moves.split(' ');
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

  getGameMoves(): string[] {
    return this.getGame().moves.split(' ');
  }

  getSide(id: string) {
    return this.game.players.black.user?.id === id ? 'black' : 'white';
  }

  getOpponentSide(id: string) {
    return this.game.players.black.user?.id === id ? 'white' : 'black';
  }

  getStatusColor(id: string) {
    const { winner, status } = this.game;
    if (status === 'draw') {
      return '';
    }

    return winner === this.getSide(id) ? 'winner' : 'loser';
  }

  updateAnalysis(analysis: { [key: string]: any }) {
    this.game.analysis = analysis;
  }
}
