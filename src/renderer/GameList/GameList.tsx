import { GameDecorator } from '../../interfaces';
import { Paper, List} from '@mui/material';
import GameTile from './GameTile';
import { useState } from 'react';
import './GameList.css'

export default function GameList({ games }: { games: GameDecorator[] }) {
  const [checked, setChecked] = useState([0]);

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

  return (
    <Paper style={{ maxHeight: '70vh', overflow: 'auto' }}>
      <List>
        {games.map((game, index) => (
          <GameTile
            game={game}
            index={index}
            checked={checked}
            key={game.getGame().id}
            handleToggle={handleToggle}
          />
        ))}
      </List>
    </Paper>
  );
}
