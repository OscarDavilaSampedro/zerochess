// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Game } from '../interfaces';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    joinPath: (pathToJoin: string) =>
      ipcRenderer.invoke('engine:joinPath', pathToJoin),
    spawnChildProcess: (command: string, args: string[]) =>
      ipcRenderer.invoke('engine:spawnChildProcess', command, args),
    insertGames: (games: Game[]) =>
      ipcRenderer.invoke('database:insertGames', games),
    getPlayerGames: (id: string): Promise<Game[]> =>
      ipcRenderer.invoke('database:getPlayerGames', id),
    getPlayerGamesCount: (id: string): Promise<number> =>
      ipcRenderer.invoke('database:getPlayerGamesCount', id),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
