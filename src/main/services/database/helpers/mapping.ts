import { Clock, Game, Player } from '../../../../interfaces';

function mapBooleanToNumber(value: boolean) {
  return value ? 1 : 0;
}

export function mapGameToRow(game: Game) {
  const clock = game.clock || {
    initial: null,
    increment: null,
    totalTime: null,
  };
  const blackPlayer = game.players.black;
  const whitePlayer = game.players.white;

  return {
    id: game.id,

    initial: clock.initial,
    increment: clock.increment,
    totalTime: clock.totalTime,

    analysis: null,
    perf: game.perf,
    speed: game.speed,
    moves: game.moves,
    source: game.source,
    status: game.status,
    winner: game.winner,
    variant: game.variant,
    createdAt: game.createdAt,
    lastMoveAt: game.lastMoveAt,
    rated: mapBooleanToNumber(game.rated),

    black_rating: blackPlayer.rating,
    black_aiLevel: blackPlayer.aiLevel,
    black_user_id: blackPlayer.user?.id,
    black_user_name: blackPlayer.user?.name,
    black_ratingDiff: blackPlayer.ratingDiff,

    white_rating: whitePlayer.rating,
    white_aiLevel: whitePlayer.aiLevel,
    white_user_id: whitePlayer.user?.id,
    white_user_name: whitePlayer.user?.name,
    white_ratingDiff: whitePlayer.ratingDiff,
  };
}

function mapRowToClock(row: any): Clock {
  return {
    initial: row.initial,
    increment: row.increment,
    totalTime: row.totalTime,
  };
}

function mapRowToPlayer(row: any, color: 'black' | 'white'): Player {
  const playerData = {
    rating: row[`${color}_rating`],
    aiLevel: row[`${color}_aiLevel`],
    ratingDiff: row[`${color}_ratingDiff`],
    user: {
      id: row[`${color}_user_id`],
      name: row[`${color}_user_name`],
    },
  };

  return playerData;
}

export function mapRowToGame(row: any): Game {
  return {
    id: row.id,
    clock: mapRowToClock(row),
    perf: row.perf,
    speed: row.speed,
    moves: row.moves,
    rated: row.rated,
    source: row.source,
    status: row.status,
    winner: row.winner,
    variant: row.variant,
    createdAt: row.createdAt,
    lastMoveAt: row.lastMoveAt,
    players: {
      black: mapRowToPlayer(row, 'black'),
      white: mapRowToPlayer(row, 'white'),
    },
    analysis: row.analysis ? JSON.parse(row.analysis) : undefined,
  };
}
