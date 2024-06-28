// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { Game } from '../interfaces';

const electronHandler = {
  ipcRenderer: {
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
    updateGameAnalysis: (
      id: string,
      analysis: { [key: string]: any },
    ): Promise<void> =>
      ipcRenderer.invoke('database:updateGameAnalysis', id, analysis),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
