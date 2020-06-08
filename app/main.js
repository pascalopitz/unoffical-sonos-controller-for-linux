const electron = require('electron');
require('dotenv').config();

const { app, Menu, BrowserWindow, clipboard, dialog } = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');
const util = require('util');

const blacklist = ['authToken', 'password', 'secret', 'CurrentMuseHouseholdId'];
const maskJson = require('mask-json')(blacklist);

const wakeEvent = require('wake-event');

const deviceProviderName = 'unofficial-sonos-controller-for-linux';

let win;

const writeFileAsync = util.promisify(fs.writeFile).bind(fs);
const readFileAsync = util.promisify(fs.readFile).bind(fs);

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
                    type: 'separator',
                },
                {
                    label: 'Copy app state to clipboard',
                    async click(item, focusedWindow) {
                        if (focusedWindow) {
                            const result = await focusedWindow.webContents.executeJavaScript(
                                'JSON.stringify(store.getState())',
                                true
                            );

                            clipboard.writeText(
                                JSON.stringify(
                                    {
                                        appState: maskJson(JSON.parse(result)),
                                        packageJson: require('./package.json'),
                                    },
                                    1,
                                    4
                                )
                            );
                        }
                    },
                },
                {
                    label: 'Save app state to file',
                    async click(item, focusedWindow) {
                        if (focusedWindow) {
                            const choice = await dialog.showSaveDialog({
                                defaultPath: path.resolve(
                                    process.env.HOME,
                                    './Downloads/unoffical-sonos-controller.appState.json'
                                ),
                            });

                            if (choice.cancelled) {
                                return;
                            }

                            const result = await focusedWindow.webContents.executeJavaScript(
                                'JSON.stringify(store.getState())',
                                true
                            );

                            await writeFileAsync(
                                choice.filePath,
                                JSON.stringify(
                                    {
                                        appState: maskJson(JSON.parse(result)),
                                        packageJson: require('./package.json'),
                                    },
                                    1,
                                    4
                                ),
                                'utf8'
                            );
                        }
                    },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Export app settings',
                    async click(item, focusedWindow) {
                        if (focusedWindow) {
                            const choice = await dialog.showSaveDialog({
                                defaultPath: path.resolve(
                                    process.env.HOME,
                                    './Downloads/unoffical-sonos-controller.settings.json'
                                ),
                            });

                            if (choice.cancelled) {
                                return;
                            }

                            const result = await focusedWindow.webContents.executeJavaScript(
                                'JSON.stringify(window.localStorage, 1, 4)',
                                true
                            );

                            await writeFileAsync(
                                choice.filePath,
                                result,
                                'utf8'
                            );
                        }
                    },
                },
                {
                    label: 'Import app settings',
                    async click(item, focusedWindow) {
                        if (focusedWindow) {
                            const choice = await dialog.showOpenDialog({
                                properties: ['openFile'],
                                defaultPath: path.resolve(
                                    process.env.HOME,
                                    './Downloads/unoffical-sonos-controller.settings.json'
                                ),
                            });

                            if (choice.cancelled) {
                                return;
                            }

                            const json = await readFileAsync(
                                choice.filePaths[0],
                                'utf8'
                            );

                            await focusedWindow.webContents.executeJavaScript(
                                `var x = ${json};
                                    Object.keys(x).forEach(k => window.localStorage[k] = x[k]);
                                    window.location.reload();
                                `,
                                true
                            );
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
