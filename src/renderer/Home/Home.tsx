import { Button, TextField, Stack, CircularProgress, Box, Paper } from '@mui/material';
import { checkPlayer, handleGameStream } from '../../http';
import { GameDecorator } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Home.css';

export default function Home({
  onGamesUpdate,
}: {
  onGamesUpdate: (games: GameDecorator[]) => void;
}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [homeError, setHomeError] = useState(false);
  const [homeHelperText, setHomeHelperText] = useState('');

  function showHomeError(isShown: boolean, text?: string) {
    setHomeHelperText(text || '');
    setHomeError(isShown);
    setLoading(false);
  }

  function showUserGames(games: GameDecorator[]) {
    onGamesUpdate(games);
    navigate('/games');
    setLoading(false);
  }

  function retrieveNewGames() {
    handleGameStream(username)
      .then((games) => {
        window.electron.ipcRenderer.insertGames(games);
        showUserGames(games.map((game) => new GameDecorator(game)));

        return games;
      })
      .catch(() => {
        setLoading(false);
        showHomeError(true, 'Hubo un error al cargar las partidas.');
      });
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
      retrieveNewGames();
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
        <CircularProgress />
      ) : (
        <Paper sx={{ padding: '2.5em 3.5em' }}>
          <Stack spacing={5}>
            <h1>Importar partidas:</h1>
            <TextField
              required
              size="small"
              value={username}
              error={homeError}
              label="Nombre de usuario"
              helperText={homeHelperText}
              onChange={(e) => setUsername(e.target.value)}
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
