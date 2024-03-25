import { Game } from '../../interfaces';
import Database from 'better-sqlite3';
import path from 'path';

interface CountResult {
  count: number;
}

function connectDatabase() {
  return Database(path.join(__dirname, '../../../release/app/database.db'));
}

export function insertGames(games: Game[]) {
  const db = connectDatabase();
  const existsStm = db.prepare('SELECT id FROM game WHERE id = @id');
  const insertStm = db.prepare(`
    INSERT INTO game (
        id, initial, increment, totalTime, perf, speed, moves,
        source, rated, status, winner, variant, createdAt, lastMoveAt,
        black_aiLevel, black_rating, black_provisional, black_user_id, black_user_name,
        white_aiLevel, white_rating, white_provisional, white_user_id, white_user_name
    ) VALUES (
        @id, @initial, @increment, @totalTime, @perf, @speed, @moves,
        @source, @rated, @status, @winner, @variant, @createdAt, @lastMoveAt,
        @black_aiLevel, @black_rating, @black_provisional, @black_user_id, @black_user_name,
        @white_aiLevel, @white_rating, @white_provisional, @white_user_id, @white_user_name
    )
  `);

  games.forEach((game) => {
    const existingGame = existsStm.get({ id: game.id });

    if (!existingGame) {
      const blackPlayer = game.players.black;
      const whitePlayer = game.players.white;
      insertStm.run({
        id: game.id,
        initial: game.clock?.initial ?? null,
        increment: game.clock?.increment ?? null,
        totalTime: game.clock?.totalTime ?? null,
        perf: game.perf,
        speed: game.speed,
        moves: game.moves,
        source: game.source,
        rated: game.rated ? 1 : 0,
        status: game.status,
        winner: game.winner,
        variant: game.variant,
        createdAt: game.createdAt,
        lastMoveAt: game.lastMoveAt,
        black_aiLevel: blackPlayer.aiLevel ?? null,
        black_rating: blackPlayer.rating ? 1 : 0,
        black_provisional: blackPlayer.provisional ? 1 : 0,
        black_user_id: blackPlayer.user?.id ?? null,
        black_user_name: blackPlayer.user?.name ?? null,
        white_aiLevel: whitePlayer.aiLevel ?? null,
        white_rating: whitePlayer.rating ? 1 : 0,
        white_provisional: whitePlayer.provisional ? 1 : 0,
        white_user_id: whitePlayer.user?.id ?? null,
        white_user_name: whitePlayer.user?.name ?? null,
      });
    }
  });

  db.close();
}

export function getPlayerGames(id: string) {
  const db = connectDatabase();
  const stm = db.prepare(
    'SELECT * FROM game WHERE black_user_id = @id or white_user_id = @id',
  );

  const rows = stm.all({ id });
  const games: Game[] = rows.map((row: any) => {
    return {
      id: row.id,
      clock: {
        initial: row.initial,
        increment: row.increment,
        totalTime: row.totalTime,
      },
      perf: row.perf,
      speed: row.speed,
      moves: row.moves,
      source: row.source,
      rated: row.rated === 1,
      status: row.status,
      winner: row.winner,
      ownerID: row.owner_id,
      variant: row.variant,
      createdAt: row.createdAt,
      lastMoveAt: row.lastMoveAt,
      players: {
        black: {
          aiLevel: row.black_aiLevel,
          rating: row.black_rating === 1,
          provisional: row.black_provisional === 1,
          user: {
            id: row.black_user_id,
            name: row.black_user_name,
          },
        },
        white: {
          aiLevel: row.white_aiLevel,
          rating: row.white_rating === 1,
          provisional: row.white_provisional === 1,
          user: {
            id: row.white_user_id,
            name: row.white_user_name,
          },
        },
      },
    };
  });

  db.close();
  return games;
}

export function getPlayerGamesCount(id: string) {
  const db = connectDatabase();
  const stm = db.prepare(
    'SELECT COUNT(*) as count FROM game WHERE black_user_id = @id or white_user_id = @id',
  );

  const result = stm.get({ id }) as CountResult;

  db.close();
  return result.count;
}
