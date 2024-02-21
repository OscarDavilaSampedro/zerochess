import { Paper, Checkbox, List, ListItem, ListItemButton, ListItemIcon, Stack, Container, ListItemText } from '@mui/material';
import { Chessboard } from 'react-chessboard';
import { Game, Player } from '../interfaces';
import { useState } from 'react';
import { Chess } from 'chess.js';

export default function GamesView({ games }: { games: Game[] })  {
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

  function parsePosition(moves: string) {
    const chess = new Chess();
    try {
      chess.loadPgn(moves);
    } catch (e: unknown) {
      console.error(e as Error);
    }

    return chess.fen();
  }

  function parsePlayerName(player: Player) {
    if (player.aiLevel) {
      return 'AI';
    } if (!player.user) {
      return 'Anonymous';
    }
    
    return player.user.name;
  }

  return (
    <Paper style={{ maxHeight: '70vh', overflow: 'auto' }}>
      <List>
        {games.map((game, index) => {
          const labelId = `checkbox-list-label-${index}`;

          return (
            <ListItem key={game.id}>
              <ListItemButton onClick={handleToggle(index)}>
                <Chessboard
                  boardWidth={210}
                  arePiecesDraggable={false}
                  position={parsePosition(game.moves)}
                />
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    tabIndex={-1}
                    disableRipple
                    checked={checked.indexOf(index) !== -1}
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText>
                  <Stack spacing={5}>
                    <Container />
                    <Container>{`${parsePlayerName(
                      game.players.black,
                    )} vs. ${parsePlayerName(game.players.white)}`}</Container>
                    <Container />
                  </Stack>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};
