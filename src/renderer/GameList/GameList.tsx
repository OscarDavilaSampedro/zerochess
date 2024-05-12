/* eslint-disable no-await-in-loop */
import { connectEngine, getAccuracy, getGameAdvantage } from '../../main/services/engine/engineService';
import { Paper, List, Button, Stack } from '@mui/material';
import { GameDecorator } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import GameTile from './GameTile';
import { useState } from 'react';
import './GameList.css';

export default function GameList({ games }: { games: GameDecorator[] }) {
  const [gamesAnalysis, setGamesAnalysis] = useState<
    Array<{ [key: string]: any }>
  >(new Array(games.length).fill({}));
  const [allChecked, setAllChecked] = useState(false);
  const [checked, setChecked] = useState([0]);
  const navigate = useNavigate();

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

  const handleToggleAll = () => {
    if (allChecked) {
      setChecked([]);
    } else {
      const allIndexes = games.map((_, index) => index);
      setChecked(allIndexes);
    }
    setAllChecked(!allChecked);
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
    <Paper sx={{ padding: '2.5em 3.5em' }}>
      <Stack spacing={5}>
        <Button variant="contained" onClick={handleToggleAll}>
          Seleccionar todas
        </Button>
        <List style={{ maxHeight: '50vh', overflow: 'auto' }}>
          {games.map((game, index) => (
            <GameTile
              game={game}
              index={index}
              checked={checked}
              key={game.getGame().id}
              totalGames={games.length}
              handleToggle={handleToggle}
            />
          ))}
        </List>
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
