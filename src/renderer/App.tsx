import { Route, Routes, useNavigate, MemoryRouter as Router } from 'react-router-dom';
import { Button, TextField, InputLabel, Stack } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import readStream from '../utils/StreamUtil';
import { useState } from 'react';
import { Games } from './Games';
import './App.css';

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [noGamesError, setNoGamesError] = useState(false);
  const [emptyUsernameError, setEmptyUsernameError] = useState(false);

  function showUserGames() {
    let games: JSON[] = [];
    const stream = fetch(`https://lichess.org/api/games/user/${username}`, {
      headers: { Accept: 'application/x-ndjson' },
    });

    const onMessage = (game: JSON) => games.push(game);
    const onComplete = () => {
      if (games.length !== 0) {
        navigate('/games');
      } else {
        setNoGamesError(true);
      }
    };

    stream
      .then(readStream(onMessage))
      .then(onComplete)
      .catch((error) => console.error('Error: ', error.message));
  }

  const handleSubmit = () => {
    setNoGamesError(false);
    setEmptyUsernameError(false);

    if (username !== '') {
      showUserGames();
    } else {
      setEmptyUsernameError(true);
    }
  };

  return (
    <Stack sx={{ backgroundColor: '#262421', padding: '2.5em 3.5em' }}>
      <h1>Importar partidas:</h1>
      <InputLabel sx={{ fontSize: '0.85em', paddingBottom: '0.5em' }}>
        Nombre de usuario
      </InputLabel>
      <TextField
        required
        size="small"
        value={username}
        sx={{ paddingBottom: '2.5em' }}
        error={emptyUsernameError || noGamesError}
        onChange={(e) => setUsername(e.target.value)}
        helperText={
          emptyUsernameError
            ? 'Debe introducir un nombre de usuario'
            : noGamesError
            ? 'El usuario seleccionado no tiene partidas'
            : ''
        }
      />
      <Button variant="contained" onClick={handleSubmit}>
        Importar partidas
      </Button>
    </Stack>
  );
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: `"Noto Sans", sans-serif`,
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
