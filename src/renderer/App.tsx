import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { Button, TextField, FormControl, FormLabel } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import readStream from '../utils/StreamUtil';
import { useState } from 'react';
import { Games } from './Games';
import './App.css';

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(false);

  function showUserGames() {
    const stream = fetch(`https://lichess.org/api/games/user/${username}`, {
      headers: { Accept: 'application/x-ndjson' },
    });
    let games: JSON[] = [];

    const onMessage = (game: JSON) => games.push(game);
    const onComplete = () => navigate('/games');

    stream
      .then(readStream(onMessage))
      .then(onComplete)
      .catch((error) => {
        console.error('Error: ', error.message);
      });
  }

  const handleSubmit = () => {
    setUsernameError(false);

    if (username === '') {
      setUsernameError(true);
    } else {
      showUserGames();
    }
  };

  return (
    <FormControl>
      <FormLabel sx={{ m: '0.5em' }}>
        Introduzca el nombre de usuario:{' '}
      </FormLabel>
      <TextField
        required
        value={username}
        sx={{ m: '0.5em' }}
        error={usernameError}
        label="Nombre de usuario"
        onChange={(e) => setUsername(e.target.value)}
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
