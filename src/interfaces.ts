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

export interface Game {
  id: string;
  clock: Clock;
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
