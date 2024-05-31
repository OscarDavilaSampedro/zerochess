import { Checkbox, ListItem, ListItemButton, ListItemIcon, Stack, ListItemText, IconButton } from '@mui/material';
import Versus from '../../../assets/images/versus.png';
import { GameDecorator } from '../../interfaces';
import DoneIcon from '@mui/icons-material/Done';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import ReactTimeAgo from 'react-time-ago';
import './GameList.css';

export default function GameTile({
  game,
  index,
  checked,
  username,
  analysis,
  handleToggle,
}: {
  index: number;
  username: string;
  checked: number[];
  game: GameDecorator;
  analysis: { [key: string]: any };
  handleToggle: (value: number) => void;
}) {
  const navigate = useNavigate();
  const rawGame = game.getGame();
  const labelId = `checkbox-list-label-${rawGame.id}`;

  const handleClick = () => {
    if (analysis) {
      navigate('/analysis', { state: { username, game, analysis } });
    } else {
      handleToggle(index);
    }
  };

  return (
    <ListItem key={rawGame.id}>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <Chessboard
            boardWidth={210}
            arePiecesDraggable={false}
            position={game.parsePosition()}
            customBoardStyle={{ borderRadius: '5px' }}
            boardOrientation={game.getSide(username)}
          />
          {analysis ? (
            <IconButton disableRipple sx={{ margin: '0 1em 0' }}>
              <DoneIcon />
            </IconButton>
          ) : (
            <Checkbox
              disableRipple
              sx={{ margin: '0 1.5em 0' }}
              onClick={() => handleToggle(index)}
              checked={checked.indexOf(index) !== -1}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          )}
        </ListItemIcon>
        <ListItemText>
          <Stack spacing={5}>
            <Stack spacing={0}>
              <p className="variant">{`${game.parseGameClock()} • ${rawGame.perf.toUpperCase()} • ${
                rawGame.rated ? 'POR PUNTOS' : 'AMISTOSA'
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
                <p>{game.parsePlayerName('white')}</p>
                <img src={Versus} alt="" />
                <p>{game.parsePlayerName('black')}</p>
              </Stack>
              <p
                className={`status ${game.getStatusColor(username)}`}
              >{`${game.parseGameStatus()} ${game.parseGameWinner()}`}</p>
            </Stack>
            <p className="moves">{game.parseGameMoves()}</p>
          </Stack>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
}
