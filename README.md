#Sonos Controller for Chrome

Tinkering with chrome apps and sonos.
The project is written in ES6 and utilizes react and flux to manage the UI

##Why?

I have recently started to use Ubuntu as my main OS, and there's no decent controller app.
So I am aiming to at some point provide a usable sonos controller that can run on Linux also, installed via chrome store.
Maybe it won't have all the functions of the real sonos player, but if I can browse the library and manage the queue, I'll be pretty damn happy.

##Install and Run

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
- [ ] Display and interact with volume controls
- [ ] Display and interact with mute button
- [x] Display and interact with queue
- [x] Display and interact with current play time UI
- [x] Display and interact with UI to start / stop / back / next
- [x] UI to browse artists / tracks / albums
- [x] Drill down from artists / tracks / albums
- [ ] Jump to places in the alphabet
- [ ] Play, add to/replace queue from library browser
- [ ] Load and display images
- [ ] Remember last selected room


##Thanks to other projects

- I ported nearly all of https://github.com/bencevans/node-sonos/ so that it works in chrome.
  Also made it into an ES6 code base where it was easy to do.

- The web interface markup and css is poached from https://github.com/jishi/node-sonos-web-controller/

- Dealing with the UPNP notifications needs a webserver, and https://github.com/kzahel/web-server-chrome provided a good insight and many snippets
