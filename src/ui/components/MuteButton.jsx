	
import React from 'react/addons';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';
import EventableMixin from '../mixins/EventableMixin';

class MuteButton {

	render () {

		var id = this.props.id || '';
		var src = this.props.muted.value ? 'svg/mute_on.svg' : 'svg/mute_off.svg'; 

		return (
			<img 
			onClick={this._toggleMute}
			className="mute-button"
			id={id}
			src={src} />
		);
	}

	_toggleMute () {
		this.trigger('volume:togglemute', this.props.id);
	}
}

MuteButton.prototype.displayName = "MuteButton";
MuteButton.prototype.mixins = [
	ImmutableOptimizations(['cursor']),
	EventableMixin
];
MuteButton.prototype.propTypes = {
	muted: React.PropTypes.instanceOf(Cursor).isRequired
};
export default React.createClass(MuteButton.prototype);