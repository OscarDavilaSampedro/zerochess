import { Button, TextField, Stack, CircularProgress, Box, Paper } from '@mui/material';
import { checkPlayer, handleGameStream } from '../../http';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../interfaces';
import { useState } from 'react';
import './Home.css';

export default function Home({
  onGamesUpdate,
}: {
  onGamesUpdate: (games: Game[]) => void;
}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [homeError, setHomeError] = useState(false);
  const [homeHelperText, setHomeHelperText] = useState('');

  function showHomeError(isShown: boolean, text?: string) {
    setHomeError(isShown);
    setHomeHelperText(text || '');
  }

  function showUserGames() {
    setLoading(true);

    handleGameStream(username)
      .then((games) => {
        onGamesUpdate(games);
        navigate('/games');
        setLoading(false);

        return games;
      })
      .catch(() => {
        setLoading(false);
        showHomeError(true, 'Se ha producido un error al cargar las partidas.');
      });
  }

  async function verifyPlayer() {
    try {
      const { exists, hasGames } = await checkPlayer(username);
      if (exists) {
        if (hasGames) {
          showUserGames();
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
