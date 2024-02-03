/* eslint-disable */
import { Paper, Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useState } from 'react';

export interface Game {
  id: String;
  perf: String;
  speed: String;
  moves: String;
  rated: boolean;
  status: String;
  winner: String;
  variant: String;
  createdAt: number;
  lastMoveAt: number;
  clock: {
    initial: number;
    increment: number;
    totalTime: number;
  };
  players: {
    black: {
      rating: boolean;
      provisional: boolean;
      user: {
        id: String;
        name: String;
      };
    };
    white: {
      rating: boolean;
      provisional: boolean;
      user: {
        id: String;
        name: String;
      };
    };
  };
}

export const Games = ({ games }: { games: Game[] }) => {
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

  function gameToString(game: Game): String {
    let nombreNegro = game.players.black.user?.name;
    let nombreBlanco = game.players.white.user?.name;
    let hora = new Date(game.createdAt).toLocaleTimeString();
    let fecha = new Date(game.createdAt).toLocaleDateString();

    return `${nombreNegro ? nombreNegro : 'Sin nombre'} vs. ${
      nombreBlanco ? nombreBlanco : 'Sin nombre'
    }, el ${fecha} a las ${hora}`;
  }

  return (
    <Paper style={{ maxHeight: '70vh', overflow: 'auto' }}>
      <List>
        {games.map((game, index) => {
          const labelId = `checkbox-list-label-${index}`;

          return (
            <ListItem key={index}>
              <ListItemButton onClick={handleToggle(index)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    tabIndex={-1}
                    disableRipple
                    checked={checked.indexOf(index) !== -1}
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={gameToString(game)} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};
