import React, { Component } from 'react';
import { Provider } from 'react-redux';

import CurrentTrack from './CurrentTrack';
import QueueList from './QueueList';
import BrowserList from './BrowserList';
import PlayControls from './PlayControls';
import PositionInfo from './PositionInfo';
import VolumeControls from './VolumeControls';
import ZoneGroupList from './ZoneGroupList';
import GroupManagement from './GroupManagement';
import MusicServiceManagement from './MusicServiceManagement';
import PlaylistManagement from './PlaylistManagement';
import EqSettings from './EqSettings';
import SearchBar from './SearchBar';
import Loader from './Loader';

const { initialise } = window;

export class Application extends Component {
    componentDidMount() {
        initialise();
    }

    render() {
        return (
            <Provider store={window.store}>
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
                    <PlaylistManagement />
                    <EqSettings />
                    <Loader />
                </div>
            </Provider>
        );
    }
}

export default Application;
