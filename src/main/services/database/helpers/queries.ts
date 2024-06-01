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
    black_aiLevel, black_rating, black_provisional, black_user_id, black_user_name,
    white_aiLevel, white_rating, white_provisional, white_user_id, white_user_name, analysis
  ) VALUES (
    @id, @initial, @increment, @totalTime, @perf, @speed, @moves,
    @source, @rated, @status, @winner, @variant, @createdAt, @lastMoveAt,
    @black_aiLevel, @black_rating, @black_provisional, @black_user_id, @black_user_name,
    @white_aiLevel, @white_rating, @white_provisional, @white_user_id, @white_user_name, @analysis
  )
`;

export const UPDATE_GAME_ANALYSIS = `
  UPDATE game SET analysis = @analysis WHERE id = @id
`;
