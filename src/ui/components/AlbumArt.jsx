import register from '../helpers/registerComponent';

import media from '../services/media';

class AlbumArt {

	render () {

		var id = this.props.id || '';
		var src = 'images/browse_missing_album_art.png'; 

		return (
			<img
			id={id}
			src={src} />
		);
	}
}

AlbumArt.prototype.mixins = [ React.addons.PureRenderMixin ];
AlbumArt.prototype.displayName = "AlbumArt";
export default register(AlbumArt);