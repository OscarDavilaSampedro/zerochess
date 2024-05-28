import { Game } from './interfaces';
import axios from 'axios';

interface CheckResult {
  exists: boolean;
  gamesCount: number;
}

interface LichessUserResponse {
  count: {
    all: number;
  };
}

export async function checkPlayer(username: string): Promise<CheckResult> {
  const LichessAPI = axios.create({
    baseURL: 'https://lichess.org/api/user/',
  });

  try {
    const response = await LichessAPI.get<LichessUserResponse>(username);

    const exists = response.status === 200;
    const gamesCount = response.data.count.all;

    return { exists, gamesCount };
  } catch (error) {
    return { exists: false, gamesCount: 0 };
  }
}

const readStream =
  (
    processLine: (line: Game) => void,
    updateProgress: (progress: number) => void,
    totalGames: number,
  ) =>
  (response: Response) => {
    const stream = response.body!.getReader();
    const matcher = /\r?\n/;
    const decoder = new TextDecoder();
    let buf = '';
    let processedGames = 0;

    const loop = (): Promise<unknown> =>
      stream.read().then(({ done, value }) => {
        if (done) {
          if (buf.length > 0) processLine(JSON.parse(buf));
        } else {
          const chunk = decoder.decode(value, {
            stream: true,
          });
          buf += chunk;

          const parts = buf.split(matcher);
          buf = parts.pop()!;
          parts
            .filter((p) => p)
            .forEach((i) => {
              processLine(JSON.parse(i));
              processedGames += 1;
              updateProgress((processedGames / totalGames) * 100);
            });
          return loop();
        }

        return null;
      });

    return loop();
  };

export function handleGameStream(
  username: string,
  updateProgress: (progress: number) => void,
  totalGames: number,
): Promise<Game[]> {
  const stream = fetch(`https://lichess.org/api/games/user/${username}`, {
    headers: { Accept: 'application/x-ndjson' },
  });

  return new Promise((resolve, reject) => {
    const games: Game[] = [];

    const onMessage = (game: Game) => games.push(game);
    const onError = (error: any) => reject(error);
    const onComplete = () => resolve(games);

    stream
      .then(readStream(onMessage, updateProgress, totalGames))
      .then(onComplete)
      .catch(onError);
  });
}
