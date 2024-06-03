export const SELECT_GAME_BY_USER_ID = `
  SELECT * FROM game WHERE black_user_id = @id OR white_user_id = @id
`;

export const COUNT_GAMES_BY_USER_ID = `
  SELECT COUNT(*) as count FROM game WHERE black_user_id = @id OR white_user_id = @id
`;

export const INSERT_GAME = `
  INSERT INTO game (
    id, initial, increment, totalTime, perf, speed, moves,
    source, rated, status, winner, variant, createdAt, lastMoveAt,
    black_aiLevel, black_rating, black_ratingDiff, black_user_id, black_user_name,
    white_aiLevel, white_rating, white_ratingDiff, white_user_id, white_user_name, analysis
  ) VALUES (
    @id, @initial, @increment, @totalTime, @perf, @speed, @moves,
    @source, @rated, @status, @winner, @variant, @createdAt, @lastMoveAt,
    @black_aiLevel, @black_rating, @black_ratingDiff, @black_user_id, @black_user_name,
    @white_aiLevel, @white_rating, @white_ratingDiff, @white_user_id, @white_user_name, @analysis
  )
`;

export const UPDATE_GAME_ANALYSIS = `
  UPDATE game SET analysis = @analysis WHERE id = @id
`;

export const CREATE_GAME_TABLE = `
  CREATE TABLE IF NOT EXISTS game (
    id TEXT PRIMARY KEY,
    initial INTEGER,
    increment INTEGER,
    totalTime INTEGER,
    perf TEXT,
    speed TEXT,
    moves TEXT,
    source TEXT,
    rated INTEGER,
    status TEXT,
    winner TEXT,
    variant TEXT,
    createdAt INTEGER,
    lastMoveAt INTEGER,
    black_aiLevel INTEGER,
    black_rating INTEGER,
    black_ratingDiff INTEGER,
    black_user_id TEXT,
    black_user_name TEXT,
    white_aiLevel INTEGER,
    white_rating INTEGER,
    white_ratingDiff INTEGER,
    white_user_id TEXT,
    white_user_name TEXT
  , analysis TEXT)
`;
