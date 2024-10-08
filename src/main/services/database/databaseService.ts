import { INSERT_GAME, CREATE_GAME_TABLE, SELECT_GAME_BY_ID, UPDATE_GAME_ANALYSIS, SELECT_GAME_BY_USER_ID, COUNT_GAMES_BY_USER_ID } from './helpers/queries';
import { mapGameToRow, mapRowToGame } from './helpers/mapping';
import { Game } from '../../../interfaces';
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

interface CountResult {
  count: number;
}

function connectDatabase() {
  const db = Database(path.join(app.getPath('userData'), 'database.db'));
  db.exec(CREATE_GAME_TABLE);

  return db;
}

export function insertGames(games: Game[]) {
  const db = connectDatabase();
  const insertStm = db.prepare(INSERT_GAME);
  const checkStm = db.prepare(SELECT_GAME_BY_ID);

  db.transaction(() => {
    games.forEach((game) => {
      const existingGame = checkStm.get({ id: game.id });
      if (!existingGame) {
        insertStm.run(mapGameToRow(game));
      }
    });
  })();

  db.close();
}

export function getPlayerGames(id: string) {
  const db = connectDatabase();
  const stm = db.prepare(SELECT_GAME_BY_USER_ID);

  const rows = stm.all({ id });
  const games = rows.map(mapRowToGame);

  db.close();
  return games;
}

export function getPlayerGamesCount(id: string) {
  const db = connectDatabase();
  const stm = db.prepare(COUNT_GAMES_BY_USER_ID);

  const result = stm.get({ id }) as CountResult;

  db.close();
  return result.count;
}

export function updateGameAnalysis(
  id: string,
  analysis: { [key: string]: any },
) {
  const db = connectDatabase();
  const stm = db.prepare(UPDATE_GAME_ANALYSIS);

  stm.run({ id, analysis: JSON.stringify(analysis) });

  db.close();
}
