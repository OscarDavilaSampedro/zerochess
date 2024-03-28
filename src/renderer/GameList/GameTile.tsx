import { Checkbox, ListItem, ListItemButton, ListItemIcon, Stack, ListItemText} from '@mui/material';
import ChessboardImage from '../../../assets/images/chessboard.png';
import Versus from '../../../assets/images/versus.png';
import { GameDecorator } from '../../interfaces';
import { Chessboard } from 'react-chessboard';
import ReactTimeAgo from 'react-time-ago';
import './GameList.css';

export default function GameTile({
  game,
  index,
  checked,
  totalGames,
  handleToggle,
}: {
  index: number;
  checked: number[];
  totalGames: number;
  game: GameDecorator;
  handleToggle: (value: number) => () => void;
}) {
  const rawGame = game.getGame();
  const labelId = `checkbox-list-label-${rawGame.id}`;

  return (
    <ListItem key={rawGame.id}>
      <ListItemButton onClick={handleToggle(index)}>
        <ListItemIcon>
          {totalGames > 50 ? (
            <img
              alt=""
              src={ChessboardImage}
              style={{ width: 210, height: 210 }}
            />
          ) : (
            <Chessboard
              boardWidth={210}
              arePiecesDraggable={false}
              position={game.parsePosition()}
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
              <p className="variant">{`${game.parseGameClock()} • ${rawGame.perf.toUpperCase()} • ${
                rawGame.rated ? 'RATED' : 'CASUAL'
              }`}</p>
              <ReactTimeAgo date={rawGame.createdAt} locale="es" />
            </Stack>
            <Stack>
              <Stack
                spacing={2}
                direction="row"
                alignItems="center"
                justifyContent="center"
              >
                <p>{game.parsePlayerName('black')}</p>
                <img src={Versus} alt="" />
                <p>{game.parsePlayerName('white')}</p>
              </Stack>
              <p className="status">{`${game.parseGameStatus()} ${game.parseGameWinner()}`}</p>
            </Stack>
            <p className="moves">{game.parseGameMoves()}</p>
          </Stack>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
}
