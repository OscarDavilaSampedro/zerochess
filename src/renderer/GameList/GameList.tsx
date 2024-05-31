/* eslint-disable no-await-in-loop */
import { connectEngine, getGameAccuracy, getGameAdvantage } from '../../main/services/engine/engineService';
import { Paper, List, Button, Stack, Pagination, Box, TextField } from '@mui/material';
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
  username: string;
  games: GameDecorator[];
}) {
  const [gamesAnalysis, setGamesAnalysis] = useState<
    Array<{ [key: string]: any }>
  >(new Array(games.length).fill(null));
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [checked, setChecked] = useState<number[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleToggle = (value: number) => {
    if (gamesAnalysis[value] === null) {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      setChecked(newChecked);
    }
  };

  const handleSearchTermChange = (newValue: string) => {
    setSearchTerm(newValue);
    setCurrentPage(1);
  };

  const filteredGames = games.filter((game) => {
    const opponentSide = game.getOpponentSide(username);
    const opponentName = game.parsePlayerName(opponentSide);

    return opponentName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const endIndex = Math.min(startIndex + GAMES_PER_PAGE, filteredGames.length);

  const currentGames = filteredGames.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);

  const handlePageChange = (_event: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  async function analyseGame(game: GameDecorator) {
    const moves = game.getGameMoves();

    const advantage = await getGameAdvantage(moves);
    const accuracy = await getGameAccuracy(moves);

    return { advantage, accuracy };
  }

  async function analyseGames(
    gamesToAnalyse: { game: GameDecorator; index: number }[],
  ) {
    const newGamesAnalysis = [...gamesAnalysis];
    const totalGames = gamesToAnalyse.length;
    await connectEngine();

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
        <Paper sx={{ padding: '2.5em 3.5em', minWidth: '48em' }}>
          <Stack spacing={5}>
            <TextField
              size="small"
              value={searchTerm}
              label="Buscar por nombre del rival"
              onChange={(e) => handleSearchTermChange(e.target.value)}
            />
            <Button variant="contained" onClick={handleToggleAll}>
              Seleccionar todas
            </Button>
            <List sx={{ maxHeight: '45vh', overflow: 'auto' }}>
              {currentGames.map((game) => (
                <GameTile
                  game={game}
                  checked={checked}
                  username={username}
                  key={game.getGame().id}
                  index={games.indexOf(game)}
                  handleToggle={handleToggle}
                  analysis={gamesAnalysis[games.indexOf(game)]}
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
