import { h, Component } from 'preact'; //eslint-disable-line
import ZoneGroupStore from '../stores/ZoneGroupStore';

class Loader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: ZoneGroupStore.getCurrent()
        };
    }

    componentDidMount() {
        ZoneGroupStore.addChangeListener(this._onChange.bind(this));
    }

    _onChange() {
        this.setState({
            current: ZoneGroupStore.getCurrent()
        });
    }

    render() {
        // if(this.state.current) {
        return null;
        // }

        const msg = 'Searching for your Sonos System ...';

        return (
            <div id="loader">
                <p>
                    {msg}
                </p>
            </div>
        );
    }
}

export default Loader;
