"use strict";

import React from 'react';

class MuteButton extends React.Component {

	render () {
		let src = this.props.muted ? 'svg/mute_on.svg' : 'svg/mute_off.svg'; 

		return (
			<img 
			onClick={this.props.clickHandler}
			className="mute-button"
			src={src} />
		);
	}
}

export default MuteButton;