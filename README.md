#Sonos Controller for Chrome

Tinkering with chrome apps and sonos.
The project is written in ES6 and utilizes react and flux to manage the UI

You can install it via the [chrome store](https://chrome.google.com/webstore/detail/sonos-controller-for-chro/cojfokmeikpnickdpoopoockilamcmoc).

![](screenshots/screenshot_1.png?raw=true)

##Why?

I have recently started to use Ubuntu as my main OS, and there's no decent controller app.
So I am aiming to at some point provide a usable sonos controller that can run on Linux also, installed via [chrome store](https://chrome.google.com/webstore/detail/sonos-controller-for-chro/cojfokmeikpnickdpoopoockilamcmoc).
Maybe it won't have all the functions of the real sonos player, but if I can browse the library and manage the queue, I'll be pretty damn happy.

##Install and Run locally

You will need node.js for this.

First, initialize the project:

	npm install

Second, build the compiled files into the js folder:

	npm run-script compile

Third, add the app in the extensions tab of chrome, via "Load unpacked extension". Select the project folder.
You will need to check the developer mode check box in order to be able to do that.
Now you should be able to run the app, and inspect console messages coming through via the window inspector.

For development, you can run the watch task, which will re-compile on change:

	npm run-script watch

##Thanks to other projects

- I ported nearly all of https://github.com/bencevans/node-sonos/ so that it works in chrome.
  Also made it into an ES6 code base where it was easy to do.

- The web interface markup and css is poached from https://github.com/jishi/node-sonos-web-controller/

- Dealing with the UPNP notifications needs a webserver, and https://github.com/kzahel/web-server-chrome provided a good insight and many snippets

##Todo / Bugs / Features

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
- [x] Remember last selected room
- [x] Display and interact with rooms/zones UI
- [x] Display and interact with volume controls for single player zones
- [x] Display and interact with volume controls for multi player zones
- [x] Display and interact with mute button
- [x] Display and interact with queue
- [x] Display and interact with current play time UI
- [x] Display and interact with UI to start / stop / back / next
- [x] UI to browse artists / tracks / albums
- [x] Drill down from artists / tracks / albums
- [x] Load and display images
- [x] Search for artists / tracks / albums
- [x] Play, add to/replace queue from library browser
- [x] Highlight currently playing track
- [x] Fix image ghosting issues
- [x] Display Loading message if there's no players
- [x] Play and remove from to the queue
- [x] Select and group remove from to the queue
- [x] BUG: Sometimes menu click adds track twice to queue
- [x] BUG: Volume slider snapping back after dragging on single player groups
- [ ] BUG: Same track in queue multiple times and selecting one selects all
- [ ] Drag and drop to reorder the queue
- [ ] Infinite scroll for search results
- [ ] Reduce amount of DOM nodes when scrolling long list with placeholder/margin
- [ ] Fix broken image issues (data url too long?)
- [ ] Fix interaction glitch when dragging group volume slider
- [ ] Find out how to query for next track
- [ ] Jump to places in the alphabet in media library
- [ ] Integrate services???