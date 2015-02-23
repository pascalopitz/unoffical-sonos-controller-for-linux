	
import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from '../mixins/ImmutableMixin';

class MuteButton extends ImmutableMixin {

	render () {

		var id = this.props.id || '';
		var src = this.props.muted.value ? 'svg/mute_on.svg' : 'svg/mute_off.svg'; 

		return (
			<img 
			onClick={this._toggleMute.bind(this)}
			className="mute-button"
			id={id}
			src={src} />
		);
	}

	_toggleMute () {
		this.trigger('volume:togglemute', this.props.id);
	}
}

MuteButton.propTypes = {
	muted: React.PropTypes.instanceOf(Cursor).isRequired
};
export default MuteButton;