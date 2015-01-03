#Sonos Controller for Chrome

Tinkering with chrome apps and sonos.

There are two parts to this:

- Porting large parts of https://github.com/bencevans/node-sonos/ so that it works in chrome. 
  Also make it into an ES6 code base by large.

- The web interface is poached from https://github.com/jishi/node-sonos-web-controller/


##State of Affairs

CURRENTLY THERE IS NO WORKING UI, IT'S JUST A FEW CONSOLE MESSAGES HAPPENING

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
- [ ] Port node-sonos UPNP Event Listener UPNP incoming message handling
- [ ] ES6ify Event Listener class
- [ ] Port node-sonos-web-controller UI to display rooms/zones UI
- [ ] Port node-sonos-web-controller UI to control volumes
- [ ] Port node-sonos-web-controller UI to  start / stop / skip / rewind
- [ ] Implement UI to browse artists / tracks / albums
