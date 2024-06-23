import { act, fireEvent, render, screen } from '@testing-library/react';
import { generateGame } from '../../main/util';
import useNavigateMock from '../../setupTests';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';
import * as http from '../../http';
import { useState } from 'react';
import Home from './Home';
import axios from 'axios';

const mockAxios = new MockAdapter(axios);

Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      insertGames: jest.fn(),
      getPlayerGamesCount: jest.fn(() => 1),
      getPlayerGames: jest.fn(() => [generateGame()]),
    },
  },
});

describe('Home component', () => {
  function MockedApp() {
    const [username, setUsername] = useState('');

    const handleUsernameUpdate = (value: string) => {
      setUsername(value);
    };

    return (
      <Home
        username={username}
        onGamesUpdate={() => undefined}
        onUsernameUpdate={handleUsernameUpdate}
      />
    );
  }

  beforeEach(() => {
    mockAxios.reset();
    useNavigateMock.mockReset();
  });

  it('should render', () => {
    render(
      <Home
        username=""
        onGamesUpdate={() => undefined}
        onUsernameUpdate={() => undefined}
      />,
    );

    const headingElement = screen.getByRole('heading', {
      name: /Importar partidas:/i,
    });

    expect(headingElement).toBeInTheDocument();
  });

  it('should show error if username field is empty', async () => {
    render(<MockedApp />);

    const importButton = screen.getByRole('button', {
      name: /Importar partidas/i,
    });

    await act(async () => {
      fireEvent.click(importButton);
    });

    const errorText = screen.getByText('Ingrese un nombre de usuario.');
    expect(errorText).toBeInTheDocument();
  });

  it('should show error if user does not exist', async () => {
    render(<MockedApp />);

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const importButton = screen.getByRole('button', {
      name: /Importar partidas/i,
    });

    mockAxios.onGet('https://lichess.org/api/user/testuser').reply(404);

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(importButton);
    });

    const errorText = screen.getByText('El usuario introducido no existe.');
    expect(errorText).toBeInTheDocument();
  });

  it('should show error if user has not played games', async () => {
    render(<MockedApp />);

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const importButton = screen.getByRole('button', {
      name: /Importar partidas/i,
    });

    mockAxios.onGet('https://lichess.org/api/user/testuser').reply(200, {
      count: {
        all: 0,
      },
    });

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testUser' } });
      fireEvent.click(importButton);
    });

    const errorText = screen.getByText('El usuario no ha jugado partidas.');
    expect(errorText).toBeInTheDocument();
  });

  it('should show error if user has not played valid games', async () => {
    render(<MockedApp />);

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const importButton = screen.getByRole('button', {
      name: /Importar partidas/i,
    });

    const gamesResponse = [
      generateGame({ moves: '' }),
      generateGame({ variant: 'fromPosition' }),
    ];

    mockAxios.onGet('https://lichess.org/api/user/testuser').reply(200, {
      count: {
        all: gamesResponse.length,
      },
    });

    const handleGameStreamMock = jest.spyOn(http, 'handleGameStream');
    handleGameStreamMock.mockResolvedValueOnce(gamesResponse);

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(importButton);
    });

    const errorText = screen.getByText('El usuario no ha jugado partidas válidas.');
    expect(errorText).toBeInTheDocument();
  });

  it('should download and import games when new games are available', async () => {
    render(<MockedApp />);

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const importButton = screen.getByRole('button', {
      name: /Importar partidas/i,
    });

    const gamesResponse = [generateGame(), generateGame()];

    mockAxios.onGet('https://lichess.org/api/user/testuser').reply(200, {
      count: {
        all: gamesResponse.length,
      },
    });

    const handleGameStreamMock = jest.spyOn(http, 'handleGameStream');
    handleGameStreamMock.mockResolvedValueOnce(gamesResponse);

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(importButton);
    });

    expect(useNavigateMock).toHaveBeenCalledWith('/games');
  });

  it('should load games from database if already present', async () => {
    render(<MockedApp />);

    const usernameInput = screen.getByLabelText(/Nombre de usuario/i);
    const importButton = screen.getByRole('button', {
      name: /Importar partidas/i,
    });

    mockAxios.onGet('https://lichess.org/api/user/testuser').reply(200, {
      count: {
        all: 1,
      },
    });

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(importButton);
    });

    expect(useNavigateMock).toHaveBeenCalledWith('/games');
  });
});
