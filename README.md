[![Build Status](https://travis-ci.org/pascalopitz/unoffical-sonos-controller-for-linux.svg?branch=master)](https://travis-ci.org/pascalopitz/unoffical-sonos-controller-for-linux) [![dependencies Status](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux/status.svg?path=app)](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux?path=app) [![devDependencies Status](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux/dev-status.svg)](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux?type=dev)

# Unofficial Sonos Controller for Linux

First I was tinkering with Chrome apps and sonos. I released this as a
Chrome app, which had a good 70k users on the Chrome store.
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

## Install via .deb file

You can find the latest .deb on the [release page](https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/releases).
You can doubleclick it on Ubuntu to install it via the Software Center, alternatively run

```bash
sudo dpkg -i sonos-controller-unofficial-amd64.deb
```

##  and Run locally

You will need node.js for this.

First, initialize the project:

```bash
npm install
```

Second, start the electron app in develop mode:

```bash
npm run develop
```

Building a deb:

```bash
npm run dist
```

This might require some additional binaries, like `graphicsMagick` and
`icnsutils`, which you can install via apt

## Firewall settings

You will need to whitelist these if you run Ubuntu firewall for example:

- TCP 1400 outgoing
- TCP 3400 incoming
- UDP 1900 outgoing
- UDP 1905 incoming

## Contributions

Feel free to fork and create pull requests. Any help with the variety of music services would be most welcome.
For any issues, please submit them on the [issues page](https://github.com/pascalopitz/unoffical-sonos-controller-for-linux/issues). To provide more context please take the time and attach a copy of your current app state. You can do this by using the "Save app state to file" option in the Developer menu.


## Thanks to other projects

- Because this started out as chrome app, I originally ported nearly all of https://github.com/bencevans/node-sonos/
  so that it worked in chrome, and made minor modifications.
  Also made it into an ES6 code base where it was easy to do.
  Then, for version 0.2.0 I have removed the ported/modified code and am now using node-sonos vanilla.

- The web interface markup and css is adapted from https://github.com/jishi/node-sonos-web-controller/

- SoCo is a great codebase that helped a lot with special cases and references: https://github.com/SoCo

- Some comments on the ruby sonos project really helped: https://github.com/gotwalt/sonos

- Node-sonos-ts has an interesting approach of auto-generating code from the Sonos XML service definitions: https://github.com/svrooij/node-sonos-ts

Please refer to the above projects' licenses (MIT), where they apply.


