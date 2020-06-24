const electron = require('electron');
const { Menu, clipboard, dialog } = electron;

const fs = require('fs');
const util = require('util');

const blacklist = ['authToken', 'password', 'secret', 'CurrentMuseHouseholdId'];
const maskJson = require('mask-json')(blacklist);

const writeFileAsync = util.promisify(fs.writeFile).bind(fs);
const readFileAsync = util.promisify(fs.readFile).bind(fs);

const register = () => {
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
            label: 'Player',
            submenu: [
                {
                    label: 'Volume Up',
                    accelerator: 'CmdOrCtrl+up',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: 'VOLUME_UP',
                            });
                    },
                },
                {
                    label: 'Volume Down',
                    accelerator: 'CmdOrCtrl+down',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: 'VOLUME_DOWN',
                            });
                    },
                },
                {
                    label: 'Mute/Unmute',
                    accelerator: 'CmdOrCtrl+m',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: 'TOGGLE_MUTE',
                            });
                    },
                },
                {
                    label: 'Play/Pause',
                    accelerator: 'CmdOrCtrl+space',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: 'TOGGLE_PLAY',
                            });
                    },
                },
                {
                    label: 'Prev',
                    accelerator: 'CmdOrCtrl+left',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: 'PREV',
                            });
                    },
                },
                {
                    label: 'Next',
                    accelerator: 'CmdOrCtrl+right',
                    click(item, win) {
                        win &&
                            win.webContents.send('command', {
                                type: 'NEXT',
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
};

export default register;
