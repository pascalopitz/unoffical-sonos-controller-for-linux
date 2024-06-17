import { Menu, clipboard, dialog, ipcMain, shell } from 'electron';

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import MaskJson from 'mask-json';

import {
    LIBRARY_INDEX,
    VOLUME_UP,
    VOLUME_DOWN,
    TOGGLE_MUTE,
    PREV,
    NEXT,
    TOGGLE_PLAY,
    ADD_PLAYER_IP,
    ADD_PLAY_URL,
} from '../common/ipcCommands';

const packageJson = require('../../app/package.json');

const blacklist = ['authToken', 'password', 'secret', 'CurrentMuseHouseholdId'];
const maskJson = MaskJson(blacklist);
const writeFileAsync = promisify(fs.writeFile).bind(fs);
const readFileAsync = promisify(fs.readFile).bind(fs);

const register = () => {
    const menuTemplate = [
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
            label: 'Player',
            submenu: [
                {
                    label: 'Volume Up',
                    accelerator: 'CmdOrCtrl+up',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: VOLUME_UP,
                            });
                    },
                },
                {
                    label: 'Volume Down',
                    accelerator: 'CmdOrCtrl+down',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: VOLUME_DOWN,
                            });
                    },
                },
                {
                    label: 'Mute/Unmute',
                    accelerator: 'CmdOrCtrl+m',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: TOGGLE_MUTE,
                            });
                    },
                },
                {
                    label: 'Play/Pause',
                    accelerator: 'CmdOrCtrl+space',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: TOGGLE_PLAY,
                            });
                    },
                },
                {
                    label: 'Prev',
                    accelerator: 'CmdOrCtrl+left',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: PREV,
                            });
                    },
                },
                {
                    label: 'Next',
                    accelerator: 'CmdOrCtrl+right',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: NEXT,
                            });
                    },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Play URL',
                    async click(item, focusedWindow) {
                        if (focusedWindow) {
                            try {
                                const value =
                                    await focusedWindow.webContents.executeJavaScript(
                                        'urlPrompt()',
                                        true,
                                    );

                                value &&
                                    focusedWindow &&
                                    focusedWindow.webContents.send('command', {
                                        type: ADD_PLAY_URL,
                                        url: value,
                                    });
                            } catch (e) {
                                //noop
                            }
                        }
                    },
                },
            ],
        },
        {
            label: 'Library',
            submenu: [
                {
                    label: 'Start Indexing',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: LIBRARY_INDEX,
                            });
                    },
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
                            const result =
                                await focusedWindow.webContents.executeJavaScript(
                                    'JSON.stringify(store.getState())',
                                    true,
                                );

                            clipboard.writeText(
                                JSON.stringify(
                                    {
                                        appState: maskJson(JSON.parse(result)),
                                        packageJson,
                                    },
                                    1,
                                    4,
                                ),
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
                                    './Downloads/unoffical-sonos-controller.appState.json',
                                ),
                            });

                            if (choice.cancelled) {
                                return;
                            }

                            const result =
                                await focusedWindow.webContents.executeJavaScript(
                                    'JSON.stringify(store.getState())',
                                    true,
                                );

                            await writeFileAsync(
                                choice.filePath,
                                JSON.stringify(
                                    {
                                        appState: maskJson(JSON.parse(result)),
                                        packageJson,
                                    },
                                    1,
                                    4,
                                ),
                                'utf8',
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
                                    './Downloads/unoffical-sonos-controller.settings.json',
                                ),
                            });

                            if (choice.cancelled) {
                                return;
                            }

                            const result =
                                await focusedWindow.webContents.executeJavaScript(
                                    'JSON.stringify(window.localStorage, 1, 4)',
                                    true,
                                );

                            await writeFileAsync(
                                choice.filePath,
                                result,
                                'utf8',
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
                                    './Downloads/unoffical-sonos-controller.settings.json',
                                ),
                            });

                            if (choice.cancelled) {
                                return;
                            }

                            const json = await readFileAsync(
                                choice.filePaths[0],
                                'utf8',
                            );

                            await focusedWindow.webContents.executeJavaScript(
                                `var x = ${json};
                                    Object.keys(x).forEach(k => window.localStorage[k] = x[k]);
                                    window.location.reload();
                                `,
                                true,
                            );
                        }
                    },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Add IP manually',
                    async click(item, focusedWindow) {
                        if (focusedWindow) {
                            try {
                                const value =
                                    await focusedWindow.webContents.executeJavaScript(
                                        'ipPrompt()',
                                        true,
                                    );

                                value &&
                                    focusedWindow &&
                                    focusedWindow.webContents.send('command', {
                                        type: ADD_PLAYER_IP,
                                        ip: value,
                                    });
                            } catch (e) {
                                //noop
                            }
                        }
                    },
                },
            ],
        },
        {
            role: 'help',
            submenu: [
                {
                    label: `Version: ${packageJson.version}`,
                    enabled: false,
                },
                {
                    label: 'Project page',
                    click() {
                        shell.openExternal(
                            'https://github.com/pascalopitz/unoffical-sonos-controller-for-linux',
                        );
                    },
                },
                {
                    label: 'Report an Issue',
                    click() {
                        shell.openExternal(
                            'https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/issues',
                        );
                    },
                },
                {
                    label: 'Latest Releases',
                    click() {
                        shell.openExternal(
                            'https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/releases',
                        );
                    },
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    ipcMain.on('library-indexing', (event, status) => {
        menuTemplate[2].submenu[0].label = status
            ? 'Index in progress ...'
            : 'Start Indexing';
        menuTemplate[2].submenu[0].enabled = !status;
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    });

    ipcMain.on('playstate-update', (event, status) => {
        menuTemplate[1].submenu[3].label =
            status === 'playing' ? 'Pause' : 'Play';

        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    });
};

export default register;
