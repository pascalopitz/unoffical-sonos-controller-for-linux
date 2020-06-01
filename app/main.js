const electron = require('electron');
require('dotenv').config();

const { app, Menu, BrowserWindow, clipboard } = electron;
const path = require('path');
const url = require('url');

const blacklist = ['authToken', 'password', 'secret', 'CurrentMuseHouseholdId'];
const maskJson = require('mask-json')(blacklist);

const wakeEvent = require('wake-event');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    const menu = Menu.buildFromTemplate([
        {
            label: 'View',
            submenu: [
                {
                    role: 'quit',
                },
                {
                    role: 'close',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'resetzoom',
                },
                {
                    role: 'zoomin',
                },
                {
                    role: 'zoomout',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'togglefullscreen',
                },
            ],
        },
        {
            label: 'Developer',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    },
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'Ctrl+Shift+I',
                    click(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents.toggleDevTools();
                        }
                    },
                },
                {
                    label: 'Copy app state to clipboard',
                    click(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents
                                .executeJavaScript(
                                    'JSON.stringify(store.getState())',
                                    true
                                )
                                .then((result) => {
                                    clipboard.writeText(
                                        JSON.stringify(
                                            maskJson(JSON.parse(result)),
                                            1,
                                            4
                                        )
                                    );
                                });
                        }
                    },
                },
            ],
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Project page',
                    click() {
                        electron.shell.openExternal(
                            'https://github.com/pascalopitz/unoffical-sonos-controller-for-linux'
                        );
                    },
                },
                {
                    label: 'Report an Issue',
                    click() {
                        electron.shell.openExternal(
                            'https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/issues'
                        );
                    },
                },
                {
                    label: 'Latest Releases',
                    click() {
                        electron.shell.openExternal(
                            'https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/releases'
                        );
                    },
                },
            ],
        },
    ]);

    Menu.setApplicationMenu(menu);

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
            win.reload();
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
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (win) {
            if (win.isMinimized()) {
                win.restore();
            }
            win.focus();
        }
    });

    app.on('ready', createWindow);

    app.on('window-all-closed', () => {
        app.quit();
    });

    app.on('activate', () => {
        if (win === null) {
            createWindow();
        }
    });
}
