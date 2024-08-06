/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */
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
  perf: string;
  clock?: Clock;
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
  ready?: boolean;
  loaded?: boolean;
  quit: () => void;
  stop_moves: () => void;
  get_cue_len: () => number;
  stream?: (data: string) => void;
  send: (
    cmd: string,
    cb?: (response: string) => void,
    stream?: (response: string) => void,
  ) => void;
}

export class GameDecorator {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  getGame(): Game {
    return this.game;
  }

  getGameMoves(): string[] {
    return this.getGame().moves.split(' ');
  }

  getOpponentSide(id: string) {
    return this.getSide(id) === 'black' ? 'white' : 'black';
  }

  getSide(id: string) {
    return this.game.players.black.user?.id === id ? 'black' : 'white';
  }

  getStatusColor(id: string) {
    const { winner, status } = this.game;
    if (status === 'draw') {
      return '';
    }

    return winner === this.getSide(id) ? 'winner' : 'loser';
  }

  parseGameClock(): string {
    const { clock } = this.game;
    let result = '∞';

    if (clock?.initial) {
      result = `${clock.initial / 60}+${clock.increment}`;
    }

    return result;
  }

  private parseGameLoser(): string {
    let result = 'Las negras';

    if (this.game.winner === 'black') {
      result = 'Las blancas';
    }

    return result;
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

  parsePosition(): string {
    const chess = new Chess();

    try {
      chess.loadPgn(this.game.moves);
    } catch (e) {
      console.error(e as Error);
    }

    return chess.fen();
  }

  setAnalysis(analysis: { [key: string]: any }) {
    this.game.analysis = analysis;
  }
}

export class GameStats {
  draws = 0;
  losses = 0;
  blunders = 0;
  mistakes = 0;
  whiteWins = 0;
  blackWins = 0;
  whiteErrors = 0;
  blackErrors = 0;
  inaccuracies = 0;
  winsAgainstLowerRating = 0;
  winsAgainstHigherRating = 0;
  errorsAgainstLowerRating = 0;
  errorsAgainstHigherRating = 0;
  modeWins = new Map<string, number>();
  modeErrors = new Map<string, number>();

  updateMistakes(
    game: Game,
    playerSide: string,
    playerRating: number | undefined,
    opponentRating: number | undefined
  ) {
    const blunders = game.analysis!.blunders[`${playerSide}Player`];
    const mistakes = game.analysis!.mistakes[`${playerSide}Player`];
    const inaccuracies = game.analysis!.inaccuracies[`${playerSide}Player`];

    this.blunders += blunders;
    this.mistakes += mistakes;
    this.inaccuracies += inaccuracies;

    const totalErrors = blunders + mistakes + inaccuracies;
    if (playerSide === 'white') {
      this.whiteErrors += totalErrors;
    } else {
      this.blackErrors += totalErrors;
    }

    if (playerRating && opponentRating) {
      if (playerRating > opponentRating) {
        this.errorsAgainstLowerRating += totalErrors;
      } else {
        this.errorsAgainstHigherRating += totalErrors;
      }
    }

    const speedErrors = this.modeErrors.get(game.speed) || 0;
    this.modeErrors.set(game.speed, speedErrors + totalErrors);
  }

  updateWins(
    gameSpeed: string,
    playerSide: string,
    playerRating: number | undefined,
    opponentRating: number | undefined
  ) {
    if (playerSide === 'white') {
      this.whiteWins += 1;
    } else {
      this.blackWins += 1;
    }

    if (playerRating && opponentRating) {
      if (playerRating > opponentRating) {
        this.winsAgainstLowerRating += 1;
      } else {
        this.winsAgainstHigherRating += 1;
      }
    }

    const speedWins = this.modeWins.get(gameSpeed) || 0;
    this.modeWins.set(gameSpeed, speedWins + 1);
  }

  updateResults(
    game: Game,
    playerSide: string,
    playerRating: number | undefined,
    opponentRating: number | undefined
  ) {
    if (game.status === 'draw') {
      this.draws += 1;
    } else if (game.winner === playerSide) {
      this.updateWins(game.speed, playerSide, playerRating, opponentRating);
    } else {
      this.losses += 1;
    }
  }

  static parseMap(map: Map<string, number>) {
    const flatArray = Array.from(map);
    const firstThree = flatArray.sort((a, b) => b[1] - a[1]).slice(0, 3);

    const keys = firstThree.map((p) => p[0]);
    const values = firstThree.map((p) => p[1]);

    return { keys, values };
  }

  getParsedWins() {
    return GameStats.parseMap(this.modeWins);
  }

  getParsedErrors() {
    return GameStats.parseMap(this.modeErrors);
  }
}
