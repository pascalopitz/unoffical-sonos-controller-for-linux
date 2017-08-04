import { h, Component } from 'preact';
import { Provider } from 'preact-redux';

import store from '../reducers';

import SonosService from '../services/SonosService';

import CurrentTrack from './CurrentTrack';
import QueueList from './QueueList';
import BrowserList from './BrowserList';
import PlayControls from './PlayControls';
import PositionInfo from './PositionInfo';
import VolumeControls from './VolumeControls';
import ZoneGroupList from './ZoneGroupList';
import GroupManagement from './GroupManagement';
// import MusicServiceManagement from './MusicServiceManagement';
// import SearchBar from './SearchBar';
import Loader from './Loader';

window.store = store;

class MusicServiceManagement extends Component {}
class SearchBar extends Component {}

class Application extends Component {
    constuctor() {
        this.state = {
            showPlayNow: true
        };
    }

    componentDidMount() {
        SonosService.mount();
    }

    render() {
        return (
            <Provider store={store}>
                <div>
                    <div id="application">
                        <header id="top-control">
                            <VolumeControls />
                            <PlayControls />
                            <PositionInfo />
                            <SearchBar />
                        </header>
                        <div id="column-container">
                            <div id="zone-container">
                                <h4>ROOMS</h4>
                                <ZoneGroupList />
                            </div>

                            <div id="status-container">
                                <CurrentTrack />
                                <QueueList />
                            </div>

                            <BrowserList />
                        </div>
                    </div>
                    <GroupManagement />
                    <MusicServiceManagement />
                    <Loader />
                </div>
            </Provider>
        );
    }
}

export default Application;
