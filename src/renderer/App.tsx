import { Route, Routes, MemoryRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GameStatistics from './GameStatistics/GameStatistics';
import GameAnalysis from './GameAnalysis/GameAnalysis';
import { GameDecorator } from '../interfaces';
import GameList from './GameList/GameList';
import { useState } from 'react';
import Home from './Home/Home';
import './App.css';

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
      primary: '#BABABA',
    },
    error: {
      main: '#E79C9C',
    },
  },
  typography: {
    fontFamily: '"Noto Sans", "Roboto", sans-serif',
  },
});

export default function App() {
  const [games, setGames] = useState<GameDecorator[]>([]);
  const [username, setUsername] = useState('');

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                username={username}
                onGamesUpdate={setGames}
                onUsernameUpdate={setUsername}
              />
            }
          />
          <Route
            path="/games"
            element={
              <GameList
                games={games}
                username={username}
                onUsernameUpdate={setUsername}
              />
            }
          />
          <Route path="/analysis" element={<GameAnalysis />} />
          <Route
            path="/statistics"
            element={<GameStatistics games={games} username={username} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
