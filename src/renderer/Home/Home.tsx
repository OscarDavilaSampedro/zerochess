import { Button, TextField, Stack, Box, Paper, LinearProgress } from '@mui/material';
import LinearProgressWithLabel from './LinearProgressWithLabel';
import { checkPlayer, handleGameStream } from '../../http';
import { GameDecorator } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Home.css';

export default function Home({
  username,
  onGamesUpdate,
  onUsernameUpdate,
}: {
  username: string;
  onUsernameUpdate: (username: string) => void;
  onGamesUpdate: (games: GameDecorator[]) => void;
}) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [homeError, setHomeError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [homeHelperText, setHomeHelperText] = useState('');

  function showHomeError(isShown: boolean, text: string = '') {
    setHomeHelperText(text);
    setHomeError(isShown);
    setDownloading(false);
    setLoading(false);
  }

  function showUserGames(games: GameDecorator[]) {
    const legalGames = games.filter((d) => {
      const game = d.getGame();
      return game.variant !== 'fromPosition' && game.moves;
    });

    if (legalGames.length > 0) {
      onGamesUpdate(legalGames);
      navigate('/games');

      setDownloading(false);
      setLoading(false);
    } else {
      showHomeError(true, 'El usuario no ha jugado partidas válidas.');
    }
  }

  function retrieveNewGames(totalGames: number) {
    handleGameStream(username, setProgress, totalGames)
      .then((games) => {
        window.electron.ipcRenderer.insertGames(games);
        showUserGames(games.map((game) => new GameDecorator(game)));

        return games;
      })
      .catch(() =>
        showHomeError(true, 'Hubo un error al cargar las partidas.'),
      );
  }

  async function retrieveOldGames() {
    showUserGames(
      (await window.electron.ipcRenderer.getPlayerGames(username)).map(
        (game) => new GameDecorator(game),
      ),
    );
  }

  async function checkForNewGames(gamesCount: number) {
    const gamesCountDB =
      await window.electron.ipcRenderer.getPlayerGamesCount(username);
    if (gamesCount !== gamesCountDB) {
      setDownloading(true);
      retrieveNewGames(gamesCount);
    } else {
      await retrieveOldGames();
    }
  }

  async function verifyPlayer() {
    setLoading(true);

    try {
      const { exists, gamesCount } = await checkPlayer(username);
      if (exists) {
        if (gamesCount !== 0) {
          checkForNewGames(gamesCount);
        } else {
          showHomeError(true, 'El usuario no ha jugado partidas.');
        }
      } else {
        showHomeError(true, 'El usuario introducido no existe.');
      }
    } catch (error) {
      showHomeError(true, 'Hubo un error al verificar el usuario.');
    }
  }

  const handleSubmit = () => {
    showHomeError(false);

    if (username !== '') {
      verifyPlayer();
    } else {
      showHomeError(true, 'Ingrese un nombre de usuario.');
    }
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ width: '25vw' }}>
          {downloading ? (
            <>
              <p>Descargando partidas...</p>
              <LinearProgressWithLabel progress={progress} />
            </>
          ) : (
            <LinearProgress />
          )}
        </Box>
      ) : (
        <Paper sx={{ padding: '2.5em 3.5em' }}>
          <Stack spacing={5}>
            <h1>Importar partidas:</h1>
            <TextField
              required
              size="small"
              error={homeError}
              label="Nombre de usuario"
              helperText={homeHelperText}
              onChange={(e) => onUsernameUpdate(e.target.value.toLowerCase())}
            />
            <Button variant="contained" onClick={handleSubmit}>
              Importar partidas
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
