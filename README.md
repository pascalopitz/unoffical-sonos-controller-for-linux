[![Build Status](https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/workflows/Build/release/badge.svg)](https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/actions?query=workflow%3ABuild%2Frelease) [![dependencies Status](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux/status.svg?path=app)](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux?path=app) [![devDependencies Status](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux/dev-status.svg)](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux?type=dev)

# Unofficial Sonos Controller for Linux

First I was tinkering with Chrome apps and sonos. I released this as a
Chrome app.
Subsequently Chrome apps turned out to be
a dying platform, so I've moved over to Electron. The project is written
in mostly ES6 and utilizes React and Redux to manage the UI

![](http://pascalopitz.github.io/unoffical-sonos-controller-for-linux/screenshots/screenshot_1.png?raw=true)

## Why?

I use Ubuntu as my main OS, and there's no decent controller app.
So I am aiming to at some point provide a usable sonos controller that
can run on Linux also, installed via deb file. Maybe it won't have all
the functions of the real sonos player, but if I can browse the library, Spotify
and manage the queue, I'll be pretty damn happy.

## Install via snap

Since v0.2.0-alpha1 the app gets published to snapcraft.

```
snap install --edge sonos-controller-unofficial
```

## Install via .AppImage file

Find the latest .AppImage on the [release page](https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/releases).
You can right click it on Ubuntu, then under "Permissions" mark is as executable. ALternatively run:

```bash
chmod +x sonos-controller-unofficial-amd64-0.2.8.AppImage
```

After that it can be launched by double click or via invoking it through the terminal.

To create a `.desktop` entry in Ubuntu, add it under something like `~/.local/share/applications/unoffical-sonos-controller-for-linux.desktop`
with the following content, of course referencing the right file)= location and version:

```
#!/usr/bin/env xdg-open
[Desktop Entry]
Terminal=false
Type=Application
Categories=Audio;
Name=sonos-controller-unofficial
Icon=appimagekit-sonos-controller-unofficial
Exec="/home/username/Downloads/sonos-controller-unofficial-0.2.8.AppImage" %U
```

## Install via .deb file

Find the latest .deb on the [release page](https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/releases).
On Ubuntu, you can double click the downloaded file to install it via the Software Center. Alternatively run

```bash
sudo dpkg -i sonos-controller-unofficial_0.2.8_amd64.deb
```

##  and Run locally

You will need an installed and fairly recent version (>=13) of [nodejs](https://nodejs.org/) for this.
Generating artefacts might require some additional binaries, like `graphicsMagick` and
`icnsutils`, which you can install via `apt`.


Clone the git repository and `cd` into the project folder.
Then initialize the project by running:

```bash
npm install
```

Start the electron app in develop mode:

```bash
npm run develop
```

Building the packaged artefacts:

```bash
npm run dist
```

## Firewall settings

You will need to whitelist these if you run Ubuntu firewall for example:

- TCP 1400 outgoing
- TCP 4000 incoming
- UDP 1900 outgoing
- UDP 1905 incoming
- TCP 13453 outgoing (for local file server)

## Troubleshooting

### Q: The app keeps searching for my Sonos system

[Device discovery](https://github.com/bencevans/node-sonos/blob/master/lib/deviceDiscovery.js#L25) utilizes the [Simple Service Discovery Protocol](https://en.wikipedia.org/wiki/Simple_Service_Discovery_Protocol) over IPv4 and relies on multicast IP addresses and UDP messages.

Make sure you check the Firewall settings above are applied correctly.

If all ports are open and search still doesn not work, but you know the IP address of one of the devices, you can add an IP manually by using the developer menu option.


## Contributions

Feel free to fork and create pull requests. Any help with the variety of music services would be most welcome.

## Issues

For any issues, please submit them on the [issues page](https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/issues).

Before you do, make sure you check the Firewall settings above are applied correctly.

To provide more context please take the time and attach a copy of your current app state. You can do this by using the "Save app state to file" option in the Developer menu.


## Thanks to other projects

- Because this started out as chrome app, I originally ported nearly all of https://github.com/bencevans/node-sonos/
  so that it worked in chrome, and made minor modifications.
  Also made it into an ES6 code base where it was easy to do.
  Then, for version 0.2 I have removed the ported/modified code and am now using node-sonos vanilla.

- The web interface markup and css is adapted from https://github.com/jishi/node-sonos-web-controller/

- SoCo is a great codebase that helped a lot with special cases and references: https://github.com/SoCo

- Some comments on the ruby sonos project really helped: https://github.com/gotwalt/sonos

- Node-sonos-ts has an interesting approach of auto-generating code from the Sonos XML service definitions: https://github.com/svrooij/node-sonos-ts

Please refer to the above projects' licenses (MIT), where they apply.


