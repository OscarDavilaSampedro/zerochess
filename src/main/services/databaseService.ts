import Database from 'better-sqlite3';
import path from 'path';

export default function connect() {
  return Database(
    path.join(__dirname, '../../../', 'release/app', 'database.db'),
    { verbose: console.log, fileMustExist: true },
  );
}
