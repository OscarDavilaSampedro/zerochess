/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { getPlayerGames, getPlayerGamesCount, insertGames, updateGameAnalysis } from './services/database/databaseService';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { resolveHtmlPath } from './util';
import childProcess from 'child_process';
import MenuBuilder from './menu';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 1024,
    minHeight: 900,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      details.responseHeaders!['Cross-Origin-Opener-Policy'] = ['same-origin'];
      details.responseHeaders!['Cross-Origin-Embedder-Policy'] = [
        'require-corp',
      ];
      callback({ responseHeaders: details.responseHeaders });
    },
  );

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    ipcMain.handle('engine:joinPath', async (_, pathToJoin) => {
      if (isDebug) {
        return path.join(__dirname, pathToJoin);
      }
      return path.join(
        __dirname.substring(0, __dirname.length - 18),
        'src/main/',
        pathToJoin,
      );
    });
    ipcMain.handle('engine:spawnChildProcess', async (_, command, args) => {
      return childProcess.spawn(command, args, { stdio: 'pipe' });
    });

    ipcMain.handle('database:insertGames', async (_, games) => {
      insertGames(games);
    });
    ipcMain.handle('database:getPlayerGames', async (_, id) => {
      return getPlayerGames(id);
    });
    ipcMain.handle('database:getPlayerGamesCount', async (_, id) => {
      return getPlayerGamesCount(id);
    });
    ipcMain.handle('database:updateGameAnalysis', async (_, id, analysis) => {
      return updateGameAnalysis(id, analysis);
    });

    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
