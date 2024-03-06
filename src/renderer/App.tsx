import { Route, Routes, MemoryRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GameList from './GameList/GameList';
import { Game } from '../interfaces';
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
          <Route path="/games" element={<GameList games={games} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
