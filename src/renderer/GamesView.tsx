import { Paper, Checkbox, List, ListItem, ListItemButton, ListItemIcon, Stack, ListItemText } from '@mui/material';
import es from 'javascript-time-ago/locale/es.json';
import { Clock, Game, Player } from '../interfaces';
import { Chessboard } from 'react-chessboard';
import Versus from '../../assets/versus.png';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago';
import { useState } from 'react';
import { Chess } from 'chess.js';

TimeAgo.addDefaultLocale(es);

export default function GamesView({ games }: { games: Game[] }) {
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

  function parseGameClock(clock: Clock) {
    if (clock?.initial) {
      return `${clock.initial / 60}+${clock.increment}`;
    }
    return '∞';
  }

  function parsePlayerName(player: Player) {
    if (player.aiLevel) {
      return 'AI';
    }
    if (!player.user) {
      return 'Anonymous';
    }

    return player.user.name;
  }

  function parseGameStatus(status: string) {
    switch (status) {
      case 'draw':
        return 'Empate';
      case 'resign':
        return 'Dimisión';
      case 'outoftime':
        return 'Sin tiempo';
      case 'mate':
        return 'Jaque mate';
      case 'timeout':
        return 'Tiempo límite';
      default:
        return 'No definido';
    }
  }

  function parseGameWinner(winner: string) {
    if (winner === 'black') {
      return ' • Ganan las negras';
    }
    if (winner === 'white') {
      return ' • Ganan las blancas';
    }
    return '';
  }

  function parseGameMoves(moves: string) {
    const movesArray = moves.split(' ');
    let result = '';

    for (let i = 0; i < 5; i += 1) {
      result += `${movesArray[i]} `;
    }

    result += `... ${movesArray.length} movimientos`;

    return result;
  }

  return (
    <Paper style={{ maxHeight: '70vh', overflow: 'auto' }}>
      <List>
        {games.map((game, index) => {
          const labelId = `checkbox-list-label-${game.id}`;

          return (
            <ListItem key={game.id}>
              <ListItemButton onClick={handleToggle(index)}>
                <ListItemIcon>
                  <Chessboard
                    boardWidth={210}
                    arePiecesDraggable={false}
                    position={parsePosition(game.moves)}
                  />
                  <Checkbox
                    edge="start"
                    tabIndex={-1}
                    disableRipple
                    sx={{ margin: '0 1.5em 0' }}
                    checked={checked.indexOf(index) !== -1}
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText>
                  <Stack spacing={5}>
                    <Stack spacing={0}>
                      <p className="variant">{`${parseGameClock(
                        game.clock,
                      )} • ${game.variant.toUpperCase()} • ${
                        game.rated ? 'RATED' : 'CASUAL'
                      }`}</p>
                      <ReactTimeAgo date={game.createdAt} locale="es" />
                    </Stack>
                    <Stack>
                      <Stack
                        spacing={2}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <p>{parsePlayerName(game.players.black)}</p>
                        <img src={Versus} alt="" />
                        <p>{parsePlayerName(game.players.white)}</p>
                      </Stack>
                      <p className="status">{`${
                        parseGameStatus(game.status) +
                        parseGameWinner(game.winner)
                      }`}</p>
                    </Stack>
                    <p className="moves">{parseGameMoves(game.moves)}</p>
                  </Stack>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
