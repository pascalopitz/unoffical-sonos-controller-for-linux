require('dotenv').config();

import { app, BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import wakeEvent from 'wake-event';
import windowStateKeeper from 'electron-window-state';

import registerMenu from './menu';

const deviceProviderName = 'unofficial-sonos-controller-for-linux';

let win;

function createWindow() {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600,
        maximize: true,
        fullScreen: true,
    });

    win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        fullscreen: mainWindowState.isFullScreen,
        maximize: mainWindowState.isMaximized,
        icon: path.join(__dirname, '/sonos-512.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, '/preload.js'),
        },
    });

    mainWindowState.manage(win);

    registerMenu();

    win.webContents.setUserAgent(
        // Thanks SoCo: https://github.com/SoCo/SoCo/blob/18ee1ec11bba8463c4536aa7c2a25f5c20a051a4/soco/music_services/music_service.py#L55
        `Linux UPnP/1.0 Sonos/36.4-41270 (ACR_:${deviceProviderName})`,
    );

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, 'window.html'),
            protocol: 'file:',
            slashes: true,
        }),
    );

    win.on('closed', () => {
        win = null;
        
    });

    wakeEvent(() => {
        if (win) {
            win.webContents.executeJavaScript('wakeup()', true);
        }
    });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) {
                win.restore();
            }
            win.focus();
        }
    });

    app.on('ready', createWindow);

    app.on('window-all-closed', () => {
        console.log("All windows closed. Quitting.")
        app.quit();
    });

    app.on('activate', () => {
        if (win === null) {
            createWindow();
        }
    });
}
