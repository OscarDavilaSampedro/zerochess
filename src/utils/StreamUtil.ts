/* eslint-disable */

const readStream =
  (processLine: (data: any) => void) => (response: Response) => {
    const stream = response.body!.getReader();
    const matcher = /\r?\n/;
    const decoder = new TextDecoder();
    let buf = '';

    const loop = (): Promise<void> =>
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
      });

    return loop();
  };

export default readStream;
