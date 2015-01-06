import port from './services/port';
import media from './services/media';

import ZoneListCtrl from './controllers/ZoneListCtrl';
import CurrentTrackCtrl from './controllers/CurrentTrackCtrl';
import PlayPauseCtrl from './controllers/PlayPauseCtrl';
import QueueCtrl from './controllers/QueueCtrl';

var app = angular.module('Sonos', []);

angular.module('Sonos').factory('port', port);
angular.module('Sonos').factory('media', media);

angular.module('Sonos').controller('ZoneListCtrl', ['$scope', 'port', ZoneListCtrl]);
angular.module('Sonos').controller('PlayPauseCtrl', ['$scope', 'port', PlayPauseCtrl]);
angular.module('Sonos').controller('CurrentTrackCtrl', ['$scope', 'port', 'media', CurrentTrackCtrl]);
angular.module('Sonos').controller('QueueCtrl', ['$scope', 'port', 'media', QueueCtrl]);