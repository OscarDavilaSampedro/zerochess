import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Button from '@mui/material/Button';
import readStream from '../utils/StreamUtil';
import './App.css';

function Hello() {
  return (
    <div>
      <Button
        variant="contained"
        onClick={() => {
          const stream = fetch('https://lichess.org/api/games/user/neio', {
            headers: { Accept: 'application/x-ndjson' },
          });

          const onMessage = (obj: any) => console.log(obj);
          const onComplete = () => console.log('The stream has completed');

          stream
            .then(readStream(onMessage))
            .then(onComplete)
            .catch((error) => {
              console.error('Error:', error);
            });
        }}
      >
        Hola
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
