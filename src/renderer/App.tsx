import { Button, TextField, Stack, CircularProgress, Box, Paper } from '@mui/material';
import { Route, Routes, useNavigate, MemoryRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import readStream from '../utils/StreamUtil';
import { Game, Games } from './Games';
import { useState } from 'react';
import './App.css';

function Home({ onGamesUpdate }: { onGamesUpdate: (games: Game[]) => void }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [homeError, setHomeError] = useState(false);
  const [homeHelperText, setHomeHelperText] = useState('');

  function showUserGames() {
    setLoading(true);
    const games: Game[] = [];
    const stream = fetch(`https://lichess.org/api/games/user/${username}`, {
      headers: { Accept: 'application/x-ndjson' },
    });

    const onMessage = (game: Game) => games.push(game);
    const onComplete = () => {
      setLoading(false);

      if (games.length !== 0) {
        onGamesUpdate(games);
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
              helperText={homeHelperText}
              label="Nombre de usuario"
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

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#B1D5F6',
    },
    secondary: {
      main: '#FFAE80',
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
  const [games, setGames] = useState<Game[]>([]);
  const handleGamesUpdate = (newGames: Game[]) => {
    setGames(newGames);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Home onGamesUpdate={handleGamesUpdate} />}
          />
          <Route path="/games" element={<Games games={games} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
