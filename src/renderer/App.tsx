import { Button, TextField, Stack, CircularProgress, Box, Paper } from '@mui/material';
import { Route, Routes, useNavigate, MemoryRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Game } from '../interfaces';
import GamesView from './GamesView';
import { useState } from 'react';
import readStream from '../http';
import './App.css';

function Home({ onGamesUpdate }: { onGamesUpdate: (games: Game[]) => void }) {
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
        showHomeError(true, 'No hay partidas para el usuario.');
      }
    };

    stream
      .then(readStream(onMessage))
      .then(onComplete)
      .catch(() => {
        setLoading(false);
        showHomeError(true, 'El usuario introducido no existe.');
      });
  }

  const handleSubmit = () => {
    showHomeError(false);

    if (username !== '') {
      showUserGames();
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

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home onGamesUpdate={setGames} />} />
          <Route path="/games" element={<GamesView games={games} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
