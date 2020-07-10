require('dotenv').config();

import { app, BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import wakeEvent from 'wake-event';

import registerMenu from './menu';
import LocalMusic from './localMusic';

const deviceProviderName = 'unofficial-sonos-controller-for-linux';

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, '/sonos-512.png'),
        webPreferences: {
            nodeIntegration: true,
        },
    });

    registerMenu();

    win.webContents.setUserAgent(
        // Thanks SoCo: https://github.com/SoCo/SoCo/blob/18ee1ec11bba8463c4536aa7c2a25f5c20a051a4/soco/music_services/music_service.py#L55
        `Linux UPnP/1.0 Sonos/36.4-41270 (ACR_:${deviceProviderName})`
    );
    win.loadURL(
        url.format({
            pathname: path.join(__dirname, 'window.html'),
            protocol: 'file:',
            slashes: true,
        })
    );

    win.on('closed', () => {
        win = null;
    });

    wakeEvent(() => {
        if (win) {
            win.webContents.executeJavaScript('SonosService.wakeup()', true);
        }
    });

    if (process.env.NODE_ENV === 'development') {
        win.webContents.toggleDevTools();
        win.maximize();
    }
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
        LocalMusic.kill();
        app.quit();
    });

    app.on('activate', () => {
        if (win === null) {
            createWindow();
        }
    });
}
