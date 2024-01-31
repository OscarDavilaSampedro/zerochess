import { Button, TextField, FormControl, FormLabel } from '@mui/material';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import readStream from '../utils/StreamUtil';
import { useState } from 'react';
import './App.css';

function Home() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(false);

  function showUserGames() {
    const stream = fetch(`https://lichess.org/api/games/user/${username}`, {
      headers: { Accept: 'application/x-ndjson' },
    });

    const onMessage = (obj: any) => console.log(obj);
    const onComplete = () => console.log('The stream has completed');

    stream
      .then(readStream(onMessage))
      .then(onComplete)
      .catch((error) => {
        console.error('Error: ', error);
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
