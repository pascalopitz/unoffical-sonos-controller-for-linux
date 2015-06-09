import React from 'react/addons';

class MuteButton extends React.Component {

	render () {

		var id = this.props.id || '';
		var src = this.props.muted ? 'svg/mute_on.svg' : 'svg/mute_off.svg'; 

		return (
			<img 
			onClick={this._toggleMute.bind(this)}
			className="mute-button"
			id={id}
			src={src} />
		);
	}

	_toggleMute () {
		// this.trigger('volume:togglemute', this.props.id);
	}
}

export default MuteButton;