import { Route, Routes, useNavigate, MemoryRouter as Router } from 'react-router-dom';
import { Button, TextField, FormLabel, FormControl } from '@mui/material';
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
    <FormControl>
      <FormLabel sx={{ m: '0.5em' }}>
        Introduzca el nombre de usuario:
      </FormLabel>
      <TextField
        required
        value={username}
        sx={{ m: '0.5em' }}
        label="Nombre de usuario"
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
      <Button onClick={handleSubmit} sx={{ m: '0.5em' }}>
        Importar partidas
      </Button>
    </FormControl>
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
