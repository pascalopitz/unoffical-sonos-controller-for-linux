import port from './services/port';
import media from './services/media';

import ZoneListCtrl from './controllers/ZoneListCtrl';
import CurrentTrackCtrl from './controllers/CurrentTrackCtrl';
import PlayPauseCtrl from './controllers/PlayPauseCtrl';
import QueueCtrl from './controllers/QueueCtrl';
import BrowserCtrl from './controllers/BrowserCtrl';

var app = angular.module('Sonos', []);

angular.module('Sonos').factory('port', port);
angular.module('Sonos').factory('media', media);

angular.module('Sonos').controller('ZoneListCtrl', ['$scope', '$rootScope', '$filter', 'port', ZoneListCtrl]);
angular.module('Sonos').controller('PlayPauseCtrl', ['$scope', '$rootScope', 'port', PlayPauseCtrl]);
angular.module('Sonos').controller('CurrentTrackCtrl', ['$scope', '$rootScope', 'port', 'media', CurrentTrackCtrl]);
angular.module('Sonos').controller('QueueCtrl', ['$scope', '$rootScope', 'port', 'media', QueueCtrl]);
angular.module('Sonos').controller('BrowserCtrl', ['$scope', '$rootScope', 'port', 'media', BrowserCtrl]);