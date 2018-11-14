/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import {app, BrowserWindow, ipcMain, Tray, Menu} from 'electron';
import path from 'path';

import MenuBuilder from './menu';

let mainWindow = null;
let splashWindow = null;

let tray;
let quitting = false;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('before-quit', () => {
  quitting = true;
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function initApp() {
  splashWindow = new BrowserWindow({
    width: 340,
    height: 510,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    movable: false,
    center: true,
    skipTaskbar: true,
    resizable: false
  });

  mainWindow = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 600,
    minHeight: 500,
    icon: path.join(__dirname, 'res', 'image', 'window', 'icon.png'),
    darkTheme: true,
    show: false,
    frame: false
  });

  splashWindow.loadURL(path.join(`file://${__dirname}`, 'views', 'splash', 'splash.html'));
  mainWindow.loadURL(path.join(`file://${__dirname}`, 'app.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    ipcMain.on('ipfs-finish-init', () => {
      if (splashWindow.isDestroyed()) {
        return;
      }

      splashWindow.destroy();
      mainWindow.show();
      mainWindow.maximize();
    });
  });

  mainWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
}

function setupTray() {
  tray = new Tray(path.join(__dirname, 'res', 'image', 'window', 'icon.png'));

  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Show App', click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quit', click: () => {
        quitting = true;
        app.quit();
      }
    }
  ]));
}

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  initApp();
  setupTray();

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
