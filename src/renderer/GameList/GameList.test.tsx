import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { GameDecorator } from '../../interfaces';
import useNavigateMock from '../../setupTests';
import { generateGame } from '../../main/util';
import '@testing-library/jest-dom';
import GameList from './GameList';

const games: GameDecorator[] = [
  new GameDecorator(
    generateGame({
      players: {
        white: { user: { id: 'testuser', name: 'testUser' } },
        black: { user: { id: 'playera', name: 'playerA' } },
      },
    }),
  ),
  new GameDecorator(
    generateGame({
      players: {
        white: { user: { id: 'testuser', name: 'testUser' } },
        black: { user: { id: 'playerb', name: 'playerB' } },
      },
    }),
  ),
  new GameDecorator(
    generateGame({
      players: {
        white: { user: { id: 'testuser', name: 'testUser' } },
        black: { user: { id: 'playerc', name: 'playerC' } },
      },
    }),
  ),
];

Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      updateGameAnalysis: jest.fn(),
    },
  },
});

jest.mock('react-time-ago', () => 'div');

const calculateErrorsMock = jest.fn();
jest.mock('../../main/services/engine/engineService', () => ({
  getGameAccuracy: () => jest.fn(),
  getGameAdvantage: () => jest.fn(),
  calculateErrors: () => calculateErrorsMock(),
}));

const connectEngineMock = jest.fn();
jest.mock('../../main/services/engine/helpers/engine', () => ({
  connectEngine: () => connectEngineMock(),
}));

describe('GameList Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render', () => {
    render(
      <GameList games={[]} username="" onUsernameUpdate={() => undefined} />,
    );

    const selectAllButton = screen.getByRole('button', {
      name: /Seleccionar todas/i,
    });

    expect(selectAllButton).toBeInTheDocument();
  });

  it('should navigate to home on clicking back button', async () => {
    const onUsernameUpdateMock = jest.fn();
    render(
      <GameList
        games={[]}
        username=""
        onUsernameUpdate={onUsernameUpdateMock}
      />,
    );

    const backButton = screen.getByRole('button', {
      name: /Atrás/i,
    });

    await act(async () => {
      fireEvent.click(backButton);
    });

    expect(onUsernameUpdateMock).toHaveBeenCalledWith('');
    expect(useNavigateMock).toHaveBeenCalledWith('/');
  });

  it('should trigger navigation when clicking statistics button', async () => {
    render(
      <GameList games={[]} username="" onUsernameUpdate={() => undefined} />,
    );

    const statisticsButton = screen.getByRole('button', {
      name: /statistics/i,
    });

    await act(async () => {
      fireEvent.click(statisticsButton);
    });

    expect(useNavigateMock).toHaveBeenCalledWith('/statistics');
  });

  it('should select and deselect games correctly', async () => {
    render(
      <GameList games={games} username="" onUsernameUpdate={() => undefined} />,
    );

    const selectAllButton = screen.getByRole('button', {
      name: /Seleccionar todas/i,
    });
    const checkboxes = screen.getAllByRole('checkbox');

    await act(async () => {
      fireEvent.click(selectAllButton);
    });

    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });

    await act(async () => {
      fireEvent.click(selectAllButton);
    });

    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('should analyse selected games', async () => {
    render(
      <GameList games={games} username="" onUsernameUpdate={() => undefined} />,
    );

    const selectAllButton = screen.getByRole('button', {
      name: /Seleccionar todas/i,
    });
    const analyseButton = screen.getByRole('button', {
      name: /Analizar/i,
    });

    fireEvent.click(selectAllButton);
    fireEvent.click(analyseButton);

    await waitFor(() => {
      expect(connectEngineMock).toHaveBeenCalledTimes(1);
      expect(calculateErrorsMock).toHaveBeenCalledTimes(games.length * 3);
    });

    const doneIcons = screen.getAllByTestId('DoneIcon');

    expect(doneIcons.length).toBe(games.length);
  });

  it('should handle navigation when clicking on a analysed game', async () => {
    render(
      <GameList
        username=""
        onUsernameUpdate={() => undefined}
        games={[new GameDecorator(generateGame({ analysis: {} }))]}
      />,
    );

    const analysedGameButton = screen.getByRole('button', {
      name: /gameTile/i,
    });

    await act(async () => {
      fireEvent.click(analysedGameButton);
    });

    expect(useNavigateMock).toHaveBeenCalled();
  });

  it('should filter games according to the search term', () => {
    render(
      <GameList
        games={games}
        username="testUser"
        onUsernameUpdate={() => undefined}
      />,
    );

    const searchInput = screen.getByLabelText(/Buscar por nombre del rival/i);
    fireEvent.change(searchInput, { target: { value: 'playerC' } });

    const gameList = screen.getAllByRole('list')[0];
    const { getAllByRole } = within(gameList);
    let gameTiles = getAllByRole('listitem');

    expect(gameTiles).toHaveLength(1);
    expect(gameTiles[0]).toHaveTextContent('playerC');

    fireEvent.change(searchInput, { target: { value: '' } });

    gameTiles = getAllByRole('listitem');

    expect(gameTiles).toHaveLength(games.length);
  });
});
