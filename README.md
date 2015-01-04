#Sonos Controller for Chrome

Tinkering with chrome apps and sonos.
The project is written in ES6 and utilizes angular 1.x to manage the UI

##State of Affairs

Currently we can only see the list of rooms/zones, but no interactions are happening yet

##Install and Run

You will need bower for this.

First, initialize the project:

	npm install
	bower install

Second, build the dist folder:

	npm run-script compile

Third, add the app in the extensions tab of chrome. You will need to check the developer mode checkbox
Now you should be able to run the app, and inspect console messages coming through via the background.js inspector.


##Todo

- [x] Create app shell and manifest
- [x] Make all ES6 compile into a JS via npm script
- [x] Single output JS
- [x] Port node-sonos discovery message via
- [x] Port node-sonos UPNP message
- [ ] ES6ify the Sonos class 
- [x] Port node-sonos UPNP Event Listener UPNP subscribe messages
- [x] Port node-sonos UPNP Event Listener UPNP incoming message handling
- [x] Make sense of topology messages
- [ ] ES6ify Event Listener class
- [ ] Display and interact with rooms/zones UI
- [ ] Display and interact with volume control UI
- [ ] Display and interact with UI to  start / stop / skip / rewind
- [ ] Implement UI to browse artists / tracks / albums


##Thanks to other projects

- I ported nearly all of https://github.com/bencevans/node-sonos/ so that it works in chrome. 
  Also made it into an ES6 code base where it was easy to do.

- The web interface markup and css is poached from https://github.com/jishi/node-sonos-web-controller/

- Dealing with the UPNP notifications needs a webserver, and https://github.com/kzahel/web-server-chrome provided a good insight and many snippets
