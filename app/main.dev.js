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
import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';

const path = require('path');
const i18n = require('i18n');

let mainWindow = null;
let splashWindow = null;

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

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function buildWindows () {
  splashWindow = new BrowserWindow({
    width: 340,
    height: 510,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    movable: false,
    center: true,
    skipTaskbar: true
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

  splashWindow.loadURL(path.join(`file://${__dirname}`, 'splash', 'splash.html'));
  mainWindow.loadURL(path.join(`file://${__dirname}`, 'app.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(function () {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }

      splashWindow.destroy();
      mainWindow.show();
      mainWindow.focus();
    }, 1000);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  buildWindows();

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
