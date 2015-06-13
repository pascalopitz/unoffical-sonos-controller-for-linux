import React from 'react/addons';

import AlbumArtStore from '../stores/AlbumArtStore';

class AlbumArt extends React.Component {

	constructor () {
		super();
		this.state = {
			src: AlbumArtStore.getByUrl(null),
		};
	}

	componentDidMount() {
		AlbumArtStore.addChangeListener(this._onChange.bind(this));
	}

	componentWillReceiveProps(props) {
		this.setState({
			src: AlbumArtStore.getByUrl(props.src),
		});
	}

	_onChange() {
		this.setState({
			src: AlbumArtStore.getByUrl(this.props.src),
		});
	}

	render () {
		return (
			<img
			src={this.state.src} />
		);
	}
}

export default AlbumArt;