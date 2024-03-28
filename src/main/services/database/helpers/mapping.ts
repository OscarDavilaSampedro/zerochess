import { Clock, Game } from '../../../../interfaces';

function setDefaultValue(value: any) {
  return value ?? null;
}

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

    perf: game.perf,
    speed: game.speed,
    moves: game.moves,
    source: game.source,
    rated: mapBooleanToNumber(game.rated),
    status: game.status,
    winner: game.winner,
    variant: game.variant,
    createdAt: game.createdAt,
    lastMoveAt: game.lastMoveAt,

    black_aiLevel: setDefaultValue(blackPlayer.aiLevel),
    black_rating: mapBooleanToNumber(blackPlayer.rating),
    black_provisional: mapBooleanToNumber(blackPlayer.provisional),
    black_user_id: setDefaultValue(blackPlayer.user?.id),
    black_user_name: setDefaultValue(blackPlayer.user?.name),

    white_aiLevel: setDefaultValue(whitePlayer.aiLevel),
    white_rating: mapBooleanToNumber(whitePlayer.rating),
    white_provisional: mapBooleanToNumber(whitePlayer.provisional),
    white_user_id: setDefaultValue(whitePlayer.user?.id),
    white_user_name: setDefaultValue(whitePlayer.user?.name),
  };
}

function mapRowToClock(row: any): Clock {
  return {
    initial: row.initial,
    increment: row.increment,
    totalTime: row.totalTime,
  };
}

function mapRowToPlayer(row: any, color: 'black' | 'white'): any {
  const playerData = {
    aiLevel: row[`${color}_aiLevel`],
    rating: row[`${color}_rating`] === 1,
    provisional: row[`${color}_provisional`] === 1,
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
    source: row.source,
    rated: row.rated === 1,
    status: row.status,
    winner: row.winner,
    variant: row.variant,
    createdAt: row.createdAt,
    lastMoveAt: row.lastMoveAt,
    players: {
      black: mapRowToPlayer(row, 'black'),
      white: mapRowToPlayer(row, 'white'),
    },
  };
}
