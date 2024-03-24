import Database from 'better-sqlite3';
import path from 'path';

function connectDatabase() {
  return Database(path.join(__dirname, '../../../release/app/database.db'), {
    verbose: console.log,
    fileMustExist: true,
  });
}

export default function getAllGames() {
  const db = connectDatabase();
  const stm = db.prepare('SELECT * FROM game');

  return stm.all();
}
