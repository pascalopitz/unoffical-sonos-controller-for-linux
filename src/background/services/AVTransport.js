import Service from './Service';

class AVTransport extends Service {

	constructor (host, port) {
		this.name = 'AVTransport';
		this.host = host;
		this.port = port || 1400;
		this.controlURL = '/MediaRenderer/AVTransport/Control';
		this.eventSubURL = '/MediaRenderer/AVTransport/Event';
		this.SCPDURL = '/xml/AVTransport1.xml';
	}

	SetAVTransportURI (options, callback) {
		this._request('SetAVTransportURI', options, callback);
	}
	
	AddURIToQueue (options, callback) {
		this._request('AddURIToQueue', options, callback);
	}
	
	AddMultipleURIsToQueue (options, callback) {
		this._request('AddMultipleURIsToQueue', options, callback);
	}
	
	ReorderTracksInQueue (options, callback) {
		this._request('ReorderTracksInQueue', options, callback);
	}
	
	RemoveTrackFromQueue (options, callback) {
		this._request('RemoveTrackFromQueue', options, callback);
	}
	
	RemoveTrackRangeFromQueue (options, callback) {
		this._request('RemoveTrackRangeFromQueue', options, callback);
	}
	
	RemoveAllTracksFromQueue (options, callback) {
		this._request('RemoveAllTracksFromQueue', options, callback);
	}
	
	SaveQueue (options, callback) {
		this._request('SaveQueue', options, callback);
	}
	
	BackupQueue (options, callback) {
		this._request('BackupQueue', options, callback);
	}
	
	GetMediaInfo (options, callback) {
		this._request('GetMediaInfo', options, callback);
	}
	
	GetTransportInfo (options, callback) {
		this._request('GetTransportInfo', options, callback);
	}
	
	GetPositionInfo (options, callback) {
		this._request('GetPositionInfo', options, callback);
	}
	
	GetDeviceCapabilities (options, callback) {
		this._request('GetDeviceCapabilities', options, callback);
	}
	
	GetTransportSettings (options, callback) {
		this._request('GetTransportSettings', options, callback);
	}
	
	GetCrossfadeMode (options, callback) {
		this._request('GetCrossfadeMode', options, callback);
	}
	
	Stop (options, callback) {
		this._request('Stop', options, callback);
	}
	
	Play (options, callback) {
		this._request('Play', options, callback);
	}
	
	Pause (options, callback) {
		this._request('Pause', options, callback);
	}
	
	Seek (options, callback) {
		this._request('Seek', options, callback);
	}
	
	Next (options, callback) {
		this._request('Next', options, callback);
	}
	
	NextProgrammedRadioTracks (options, callback) {
		this._request('NextProgrammedRadioTracks', options, callback);
	}
	
	Previous (options, callback) {
		this._request('Previous', options, callback);
	}
	
	NextSection (options, callback) {
		this._request('NextSection', options, callback);
	}
	
	PreviousSection (options, callback) {
		this._request('PreviousSection', options, callback);
	}
	
	SetPlayMode (options, callback) {
		this._request('SetPlayMode', options, callback);
	}
	
	SetCrossfadeMode (options, callback) {
		this._request('SetCrossfadeMode', options, callback);
	}
	
	NotifyDeletedURI (options, callback) {
		this._request('NotifyDeletedURI', options, callback);
	}
	
	GetCurrentTransportActions (options, callback) {
		this._request('GetCurrentTransportActions', options, callback);
	}
	
	BecomeCoordinatorOfStandaloneGroup (options, callback) {
		this._request('BecomeCoordinatorOfStandaloneGroup', options, callback);
	}
	
	DelegateGroupCoordinationTo (options, callback) {
		this._request('DelegateGroupCoordinationTo', options, callback);
	}
	
	BecomeGroupCoordinator (options, callback) {
		this._request('BecomeGroupCoordinator', options, callback);
	}
	
	BecomeGroupCoordinatorAndSource (options, callback) {
		this._request('BecomeGroupCoordinatorAndSource', options, callback);
	}
};

export default AVTransport;
