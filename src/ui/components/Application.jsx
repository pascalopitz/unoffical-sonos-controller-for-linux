import { h, Component } from 'preact'; //eslint-disable-line

import SonosService from '../services/SonosService';

import CurrentTrack from './CurrentTrack';
import QueueList from './QueueList';
import BrowserList from './BrowserList';
import PlayControls from './PlayControls';
import PositionInfo from './PositionInfo';
import VolumeControls from './VolumeControls';
import ZoneGroupList from './ZoneGroupList';
import GroupManagement from './GroupManagement';
import MusicServiceManagement from './MusicServiceManagement';
import SearchBar from './SearchBar';
import Loader from './Loader';
import AlarmSettings from './AlarmSettings';
import AlarmManagement from './AlarmManagement';

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
            <div>
                <div id="application">
                    <header id="top-control">
                        <VolumeControls />
                        <PlayControls />
                        <PositionInfo />
                        <SearchBar />
                        <AlarmSettings />
                    </header>
                    <div id="column-container">
                        <div id="zone-container">
                            <h4>ROOMS</h4>
                            <ZoneGroupList />
                        </div>

                        <div id="status-container">
                            <CurrentTrack expanded={this.state.showPlayNow} />
                            <QueueList expanded={!this.state.showPlayNow} />
                        </div>

                        <BrowserList />
                    </div>
                </div>
                <GroupManagement />
                <MusicServiceManagement />
                <AlarmManagement />
                <Loader />
            </div>
        );
    }
}

export default Application;
