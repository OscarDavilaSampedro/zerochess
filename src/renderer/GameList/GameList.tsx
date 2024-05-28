/* eslint-disable no-await-in-loop */
import { connectEngine, getAccuracy, getGameAdvantage } from '../../main/services/engine/engineService';
import { Paper, List, Button, Stack, Pagination } from '@mui/material';
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
  >(new Array(games.length).fill({}));
  const [checked, setChecked] = useState<number[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const handleToggleAll = () => {
    if (allChecked) {
      setChecked([]);
    } else {
      const allIndexes = games.map((_, index) => index);
      setChecked(allIndexes);
    }
    setAllChecked(!allChecked);
  };

  const handleToggle = (value: number) => () => {
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
    const accuracy = await getAccuracy(moves);

    return { advantage, accuracy };
  }

  async function analyseGames(
    gamesToAnalyse: { game: GameDecorator; index: number }[],
  ) {
    const newGamesAnalysis = [...gamesAnalysis];
    await connectEngine();

    for (let i = 0; i < gamesToAnalyse.length; i += 1) {
      const { game, index } = gamesToAnalyse[i];
      newGamesAnalysis[index] = await analyseGame(game);
    }

    setGamesAnalysis(newGamesAnalysis);
  }

  const handleSubmit = async () => {
    const gamesToAnalyse = games
      .map((game, index) => ({ game, index }))
      .filter(({ index }) => checked.includes(index));

    await analyseGames(gamesToAnalyse);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Paper sx={{ padding: '2.5em 3.5em', minWidth: '40vw' }}>
      <Stack spacing={5}>
        <Button variant="contained" onClick={handleToggleAll}>
          Seleccionar todas
        </Button>
        <List style={{ maxHeight: '50vh', overflow: 'auto' }}>
          {currentGames.map((game, index) => (
            <GameTile
              game={game}
              checked={checked}
              username={username}
              key={game.getGame().id}
              index={startIndex + index}
              handleToggle={handleToggle}
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
  );
}
