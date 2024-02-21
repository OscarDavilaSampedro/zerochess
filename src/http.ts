import { Game } from './interfaces';

const readStream =
  (processLine: (line: Game) => void) => (response: Response) => {
    const stream = response.body!.getReader();
    const matcher = /\r?\n/;
    const decoder = new TextDecoder();
    let buf = '';

    const loop = (): Promise<unknown> => // Uso del tipo 'unknown' en lugar de 'any'
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
          parts.filter((p) => p).forEach((i) => processLine(JSON.parse(i)));
          return loop();
        }

        return null; // Se debe incluir un return dentro de una función then, incluso si la promesa no devuelve ningún valor
      });

    return loop();
  };

export default readStream;
