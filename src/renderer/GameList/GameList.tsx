import { Paper, Checkbox, List, ListItem, ListItemButton, ListItemIcon, Stack, ListItemText } from '@mui/material';
import { Clock, Game, Player } from '../../interfaces';
import { Chessboard } from 'react-chessboard';
import Versus from '../../../assets/versus.png';
import ReactTimeAgo from 'react-time-ago';
import { useState } from 'react';
import { Chess } from 'chess.js';
import './GameList.css'

export default function GameList({ games }: { games: Game[] }) {
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
      return `Stockfish nivel ${player.aiLevel}`;
    }
    if (!player.user) {
      return 'Anónimo';
    }

    return player.user.name;
  }

  function parseGameLoser(winner: string) {
    if (winner === 'black') {
      return 'Las blancas';
    }
      return 'Las negras';
    
  }

  function parseGameStatus(winner: string, status: string) {
    switch (status) {
      case 'draw':
        return 'Tablas';
      case 'cheat':
        return 'Trampa detectada';
      case 'resign':
        return `${parseGameLoser(winner)} abandonaron`;
      case 'outoftime':
        return `${parseGameLoser(winner)} agotaron su tiempo`;
      case 'mate':
        return 'Jaque mate';
      case 'timeout':
        return `${parseGameLoser(winner)} han dejado la partida`;
      default:
        return 'No definido';
    }
  }

  function parseGameWinner(winner: string, status: string) {
    if (status !== 'draw') {
      if (winner === 'black') {
        return ` • Las negras ganan`;
      }
        return ' • Las blancas ganan';
      
    }

    return '';
  }

  function parseGameMoves(moves: string) {
    const movesArray = moves.split(' ');
    let result = '';

    let i = 0;
    let turn = 1;
    for (; i < movesArray.length && turn < 4; i += 2, turn += 1) {
      const secondMove = movesArray[i + 1] ? movesArray[i + 1]: '';
      result += `${turn}. ${movesArray[i]} ${secondMove} `;
    }

    const numberOfMoves = Math.ceil(movesArray.length / 2);
    if (numberOfMoves > 3) {
      result += `... ${Math.ceil(movesArray.length / 2)} movimientos`;
    }

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
                  {games.length < 50 && (
                    <Chessboard
                      boardWidth={210}
                      arePiecesDraggable={false}
                      position={parsePosition(game.moves)}
                    />
                  )}
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
                      )} • ${game.perf.toUpperCase()} • ${
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
                        parseGameStatus(game.winner, game.status) +
                        parseGameWinner(game.winner, game.status)
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
