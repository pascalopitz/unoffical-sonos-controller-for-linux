#Sonos Controller for Chrome

Tinkering with chrome apps and sonos.
The project is written in ES6 and utilizes react and react-cursor to manage the UI

##State of Affairs

- we can see the list of rooms/zones
- the current track info displays
- play/pause/prev/next works
- queue is displaying, and a double click will jump to that track
- we can browse one level of the media library

##Install and Run

You will need node.js and bower for this.

First, initialize the project:

	npm install

Second, build the compiled files into the js folder:

	npm run-script compile

Third, add the app in the extensions tab of chrome, via "Load unpacked extension". Select the project folder.
You will need to check the developer mode check box in order to be able to do that.
Now you should be able to run the app, and inspect console messages coming through via the window inspector.

For development, you can run the watch task, which will re-compile on change:

	npm run-script watch

##Todo

- [x] Create app shell and manifest
- [x] Make all ES6 compile into a JS via npm script
- [x] Single output JS
- [x] Port node-sonos discovery message via
- [x] Port node-sonos UPNP message
- [x] ES6ify the Sonos class
- [x] Port node-sonos UPNP Event Listener UPNP subscribe messages
- [x] Port node-sonos UPNP Event Listener UPNP incoming message handling
- [x] Make sense of topology messages
- [x] ES6ify Event Listener class
- [x] UPNP subscriptions for selected zone
- [ ] Display Loading message if there's no players
- [x] Display and interact with rooms/zones UI
- [ ] Display and interact with volume control UI
- [x] Display and interact with queue
- [ ] Display and interact with current play time UI
- [ ] Display and interact with UI to start / stop / skip / rewind
- [ ] UI to browse artists / tracks / albums



##Thanks to other projects

- I ported nearly all of https://github.com/bencevans/node-sonos/ so that it works in chrome.
  Also made it into an ES6 code base where it was easy to do.

- The web interface markup and css is poached from https://github.com/jishi/node-sonos-web-controller/

- Dealing with the UPNP notifications needs a webserver, and https://github.com/kzahel/web-server-chrome provided a good insight and many snippets
