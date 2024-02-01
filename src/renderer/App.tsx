import { Button, TextField, Stack, CircularProgress, Box, Paper } from '@mui/material';
import { Route, Routes, useNavigate, MemoryRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import readStream from '../utils/StreamUtil';
import { useState } from 'react';
import { Games } from './Games';
import './App.css';

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [homeError, setHomeError] = useState(false);
  const [homeHelperText, setHomeHelperText] = useState('');

  function showUserGames() {
    setLoading(true);
    const games: JSON[] = [];
    const stream = fetch(`https://lichess.org/api/games/user/${username}`, {
      headers: { Accept: 'application/x-ndjson' },
    });

    const onMessage = (game: JSON) => games.push(game);
    const onComplete = () => {
      setLoading(false);

      if (games.length !== 0) {
        navigate('/games');
      } else {
        setHomeError(true);
        setHomeHelperText('No hay partidas para el usuario.');
      }
    };

    stream
      .then(readStream(onMessage))
      .then(onComplete)
      .catch((error) => {
        console.error('Error: ', error.message);

        setLoading(false);
        setHomeError(true);
        setHomeHelperText('El usuario introducido no existe.');
      });
  }

  const handleSubmit = () => {
    setHomeError(false);
    setHomeHelperText('');

    if (username !== '') {
      showUserGames();
    } else {
      setHomeError(true);
      setHomeHelperText('Ingrese un nombre de usuario.');
    }
  };

  return (
    <Box>
      {loading ? (
        <CircularProgress color="secondary" />
      ) : (
        <Paper sx={{ padding: '2.5em 3.5em' }}>
          <Stack spacing={5}>
            <h1>Importar partidas:</h1>
            <TextField
              required
              size="small"
              value={username}
              error={homeError}
              helperText={homeHelperText}
              label="Nombre de usuario"
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
            >
              Importar partidas
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3c3934',
    },
    secondary: {
      main: '#d64f00',
    },
    background: {
      default: '#161512',
      paper: '#262421',
    },
    text: {
      primary: '#bababa',
    },
    error: {
      main: '#cc3333',
    },
  },
  typography: {
    fontFamily: '"Noto Sans", "Roboto", sans-serif',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
