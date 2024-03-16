import es from 'javascript-time-ago/locale/es.json';
import { createRoot } from 'react-dom/client';
import TimeAgo from 'javascript-time-ago';
import App from './App';

TimeAgo.addDefaultLocale(es);

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
