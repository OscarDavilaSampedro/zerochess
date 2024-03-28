import { Paper, List, Button, Stack } from '@mui/material';
import { GameDecorator } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import GameTile from './GameTile';
import { useState } from 'react';
import './GameList.css';

export default function GameList({ games }: { games: GameDecorator[] }) {
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

  const handleSubmit = async () => {
    const gamesToAnalyse = games.filter((_game, index) =>
      checked.includes(index),
    );

    console.log(gamesToAnalyse);
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
