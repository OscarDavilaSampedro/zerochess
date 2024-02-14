export interface Game {
  id: string;
  clock: Clock;
  perf: string;
  speed: string;
  moves: string;
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
}

export interface Clock {
  initial: number;
  increment: number;
  totalTime: number;
}

export interface Player {
  aiLevel: number;
  rating: boolean;
  provisional: boolean;
  user: {
    id: string;
    name: string;
  };
}
