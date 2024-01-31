import { Button, TextField, FormControl, FormLabel } from '@mui/material';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import './App.css';
import readStream from '../utils/StreamUtil';

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
      <FormLabel>Introduzca el nombre de usuario: </FormLabel>
      <TextField
        required
        value={username}
        error={usernameError}
        label="Nombre de usuario"
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button variant="contained" onClick={handleSubmit}>
        Importar partidas
      </Button>
    </FormControl>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
