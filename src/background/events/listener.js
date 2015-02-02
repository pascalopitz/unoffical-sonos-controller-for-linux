import xml2js from '../helpers/xml2js';
import request from '../helpers/request';
import ip from '../helpers/ip';

import Stream from './IncomingStream';

import _ from 'lodash';


var listeners = {};

chrome.sockets.tcpServer.onAccept.addListener(function (info) {
  var stream = new Stream(info.clientSocketId, function (request) {

    if(listeners[info.socketId]) {
      listeners[info.socketId]._messageHandler(request); 
    }

  });
});



class Listener {

  constructor (device) {
    this.device = device;
    this.parser = new xml2js.Parser();
    this.services = {};
  }


  _startInternalServer (callback) {
    var self = this;
    
    chrome.sockets.tcpServer.create(null, function (info) {
       chrome.sockets.tcpServer.listen(info.socketId, ip.address(), 0, null, function () {

          chrome.sockets.tcpServer.getInfo(info.socketId, function (i) {
    
            self.server = true;
            self.port = i.localPort;

            listeners[info.socketId] = self;
            callback();
          });

       });  
     });
  }


  _messageHandler (req) {

    if (req.method.toUpperCase() === 'NOTIFY' && req.uri.toLowerCase() === '/notify') {

      if (!this.services[req.headers.sid])
        return;

      var thisService = this.services[req.headers.sid];

      var items = thisService.data || {};
      this.parser.parseString(req.body.toString(), function(error, data) {
        _.each(data['e:propertyset']['e:property'], function(element) {
          _.each(_.keys(element), function(key) {
            items[key] = element[key][0];
          });
        });

        this.serviceEventCallback(thisService.endpoint, req.headers.sid, thisService.data);
      }.bind(this));

    }
  }


  onServiceEvent (f) {
    this.serviceEventCallback = f;
  }


  addService (serviceEndpoint, callback) {
    if (!this.server) {
      throw 'Service endpoints can only be added after listen() is called';
    } else {

      var opt = {
        url: 'http://' + this.device.host + ':' + this.device.port + serviceEndpoint,
        method: 'SUBSCRIBE',
        headers: {
          callback: '<http://' + ip.address() + ':' + this.port + '/notify>',
          NT: 'upnp:event',
          Timeout: 'Second-3600'
        }
      };

      request(opt, function(err, response) {
        if (err || response.statusCode !== 200) {
          console.log(response.message || response.statusCode);
          callback(err || response.statusMessage);
        } else {
          callback(null, response.headers.sid);

          this.services[response.headers.sid] = {
            endpoint: serviceEndpoint,
            data: {}
          };
        }
      }.bind(this));

    }
  }


  listen (callback) {

    if (!this.server) {
      this._startInternalServer(callback);
    } else {
      throw 'Service listener is already listening';
    }
  }


  removeService (sid, callback) {
    if (!this.server) {
      throw 'Service endpoints can only be modified after listen() is called';
    } else if (!this.services[sid]) {
      throw 'Service with sid ' + sid + ' is not registered';
    } else {

      var opt = {
        url: 'http://' + this.device.host + ':' + this.device.port + this.services[sid].endpoint,
        method: 'UNSUBSCRIBE',
        headers: {
          sid: sid
        }
      };

      request(opt, function(err, response) {
        if (err || response.statusCode !== 200) {
          callback(err || response.statusCode);
        } else {

          callback(null, true);
        }
      });

    }
  }

}

export default Listener;