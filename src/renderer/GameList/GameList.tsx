/* eslint-disable no-await-in-loop */
import { connectEngine, getGameAdvantage } from '../../main/services/engine/engineService';
import { Paper, List, Button, Stack, Pagination, Box } from '@mui/material';
import LinearProgressWithLabel from '../LinearProgressWithLabel';
import { GameDecorator } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import GameTile from './GameTile';
import './GameList.css';

const GAMES_PER_PAGE = 10;
export default function GameList({
  games,
  username,
}: {
  games: GameDecorator[];
  username: string;
}) {
  const [gamesAnalysis, setGamesAnalysis] = useState<
    Array<{ [key: string]: any }>
  >(new Array(games.length).fill(null));
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [checked, setChecked] = useState<number[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleToggleAll = () => {
    if (allChecked) {
      setChecked([]);
    } else {
      const allIndexes = games
        .map((_, index) => index)
        .filter((index) => gamesAnalysis[index] === null);
      setChecked(allIndexes);
    }
    setAllChecked(!allChecked);
  };

  const handleToggle = (value: number) => () => {
    if (gamesAnalysis[value] !== null) return;

    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const endIndex = Math.min(startIndex + GAMES_PER_PAGE, games.length);

  const currentGames = games.slice(startIndex, endIndex);
  const totalPages = Math.ceil(games.length / GAMES_PER_PAGE);

  const handlePageChange = (_event: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  async function analyseGame(game: GameDecorator) {
    const moves = game.getGameMoves();

    const advantage = await getGameAdvantage(moves);
    // const accuracy = await getAccuracy(moves);

    return { advantage };
  }

  async function analyseGames(
    gamesToAnalyse: { game: GameDecorator; index: number }[],
  ) {
    const newGamesAnalysis = [...gamesAnalysis];
    await connectEngine();

    const totalGames = gamesToAnalyse.length;
    let totalTime = 0;

    for (let i = 0; i < totalGames; i += 1) {
      const { game, index } = gamesToAnalyse[i];
      const startTime = performance.now();

      newGamesAnalysis[index] = await analyseGame(game);

      const endTime = performance.now();
      const gameTime = endTime - startTime;

      totalTime += gameTime;
      const averageTimePerGame = totalTime / (i + 1);
      const estimatedTotalTime = (averageTimePerGame * totalGames) / 1000;

      const remainingTime = estimatedTotalTime - totalTime / 1000;
      setEstimatedTime(`${Math.round(remainingTime)} segundos`);
      setProgress(((i + 1) / totalGames) * 100);
    }

    setGamesAnalysis(newGamesAnalysis);
    setChecked([]);
  }

  const handleSubmit = async () => {
    const gamesToAnalyse = games
      .map((game, index) => ({ game, index }))
      .filter(({ index }) => checked.includes(index));

    if (gamesToAnalyse.length > 0) {
      setLoading(true);
      await analyseGames(gamesToAnalyse);
      setLoading(false);

      setEstimatedTime(null);
      setProgress(0);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ width: '25vw' }}>
          <p>
            Analizando partidas...
            {estimatedTime ? ` (Tiempo estimado: ${estimatedTime})` : ''}
          </p>
          <LinearProgressWithLabel progress={progress} />
        </Box>
      ) : (
        <Paper sx={{ padding: '2.5em 3.5em', minWidth: '40vw' }}>
          <Stack spacing={5}>
            <Button variant="contained" onClick={handleToggleAll}>
              Seleccionar todas
            </Button>
            <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
              {currentGames.map((game, index) => (
                <GameTile
                  game={game}
                  checked={checked}
                  username={username}
                  key={game.getGame().id}
                  index={startIndex + index}
                  handleToggle={handleToggle}
                  analysis={gamesAnalysis[startIndex + index]}
                />
              ))}
            </List>
            <Pagination
              showLastButton
              showFirstButton
              count={totalPages}
              onChange={handlePageChange}
              sx={{ alignSelf: 'center' }}
            />
            <Stack spacing={5} direction="row">
              <Button fullWidth variant="contained" onClick={handleSubmit}>
                Analizar
              </Button>
              <Button
                fullWidth
                color="secondary"
                variant="contained"
                onClick={handleBack}
              >
                Atrás
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
