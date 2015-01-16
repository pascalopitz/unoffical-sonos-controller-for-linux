import register from '../helpers/registerComponent';

class MuteButton {

	render () {

		var id = this.props.id || '';
		var src = this.props.muted ? 'svg/mute_on.svg' : 'svg/mute_off.svg'; 

		return (
			<img 
			className="mute-button"
			id={id}
			src={src} />
		);
	}
}

MuteButton.prototype.displayName = "MuteButton";
export default register(MuteButton);