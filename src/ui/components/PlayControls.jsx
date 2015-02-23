import React from 'react/addons';
import { Cursor }  from 'react-cursor';
import ImmutableMixin from '../mixins/ImmutableMixin';

class PlayControls extends ImmutableMixin {

	render () {
		var src = this.props.model.value.playing ? "svg/pause.svg" : "svg/play.svg";

		return (
			<div id="controls">
				<img id="prev" src="svg/prev.svg" onClick={this._prev.bind(this)} />
				<div id="play-pause" className="play" onClick={this._toggle.bind(this)} >
					<img id="play" src={src} />
				</div>
				<img id="next" src="svg/next.svg" onClick={this._next.bind(this)} />

			</div>

		);
	}

	_toggle () {
		this.trigger('playstate:toggle');
	}

	_prev () {
		this.trigger('playstate:prev');
	}

	_next () {
		this.trigger('playstate:next');
	}
}

PlayControls.propTypes = {
	model: React.PropTypes.instanceOf(Cursor).isRequired
};
export default PlayControls;