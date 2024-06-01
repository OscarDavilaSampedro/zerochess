import { COUNT_GAMES_BY_USER_ID, INSERT_GAME, SELECT_GAME_BY_USER_ID, UPDATE_GAME_ANALYSIS } from './helpers/queries';
import { mapGameToRow, mapRowToGame } from './helpers/mapping';
import { Game } from '../../../interfaces';
import Database from 'better-sqlite3';
import path from 'path';

interface CountResult {
  count: number;
}

function connectDatabase() {
  return Database(path.join(__dirname, '../../../../release/app/database.db'));
}

export function insertGames(games: Game[]) {
  const db = connectDatabase();
  const insertStm = db.prepare(INSERT_GAME);

  const batchSize = 1000;
  const gameBatches: Game[][] = [];
  for (let i = 0; i < games.length; i += batchSize) {
    gameBatches.push(games.slice(i, i + batchSize));
  }

  db.transaction(() => {
    gameBatches.forEach((batch) => {
      batch.forEach((game) => {
        insertStm.run(mapGameToRow(game));
      });
    });
  })();

  db.close();
}

export function getPlayerGames(id: string) {
  const db = connectDatabase();
  const stm = db.prepare(SELECT_GAME_BY_USER_ID);

  const rows = stm.all({ id });
  const games: Game[] = rows.map(mapRowToGame);

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
