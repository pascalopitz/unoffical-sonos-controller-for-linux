[![Build Status](https://travis-ci.org/pascalopitz/unoffical-sonos-controller-for-linux.svg?branch=master)](https://travis-ci.org/pascalopitz/unoffical-sonos-controller-for-linux) [![dependencies Status](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux/status.svg?path=app)](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux?path=app) [![devDependencies Status](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux/dev-status.svg)](https://david-dm.org/pascalopitz/unoffical-sonos-controller-for-linux?type=dev)

# Unofficial Sonos Controller for Linux

First I was tinkering with chrome apps and sonos, but chrome apps are
a dying platform, so I've moved over to Electron. The project is written
in mostly ES6 and utilizes React and Redux to manage the UI

![](http://pascalopitz.github.io/unoffical-sonos-controller-for-linux/screenshots/screenshot_1.png?raw=true)

## Why?

I use Ubuntu as my main OS, and there's no decent controller app.
So I am aiming to at some point provide a usable sonos controller that
can run on Linux also, installed via deb file. Maybe it won't have all
the functions of the real sonos player, but if I can browse the library
and manage the queue, I'll be pretty damn happy. Previously this was a
chrome app, and I had a good 70k users on the chrome store.

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

## Thanks to other projects

- I ported nearly all of https://github.com/bencevans/node-sonos/
  so that it worked in chrome, and made minor modifications.
  Also made it into an ES6 code base where it was easy to do.

- The web interface markup and css is poached from https://github.com/jishi/node-sonos-web-controller/

Please refer to the above projects' licenses (MIT), where they apply.


