/* eslint-disable */
import { Paper, Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Container } from '@mui/material';
import { Chessboard } from 'react-chessboard';
import { Game, Player } from '../interfaces';
import { useState } from 'react';
import { Chess } from 'chess.js';

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

  function parsePosition(moves: string) {
    let chess = new Chess();
    try {
      chess.loadPgn(moves);
    } catch (error: any) {
      console.error('Error: ', error.message);
    } finally {
      return chess.fen();
    }
  }

  function parsePlayerName(player: Player) {
    if (player.aiLevel) {
      return 'AI';
    } else if (!player.user) {
      return 'Anonymous';
    } else {
      return player.user.name;
    }
  }

  return (
    <Paper style={{ maxHeight: '70vh', overflow: 'auto' }}>
      <List>
        {games.map((game, index) => {
          const labelId = `checkbox-list-label-${index}`;
          console.log(typeof game.players.white);

          return (
            <ListItem key={index}>
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
                <Stack spacing={5}>
                  <Container></Container>
                  <Container>{`${parsePlayerName(
                    game.players.black,
                  )} vs. ${parsePlayerName(game.players.white)}`}</Container>
                  <Container></Container>
                </Stack>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};
