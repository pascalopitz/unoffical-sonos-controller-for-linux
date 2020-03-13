import React from 'react';
import { connect } from 'react-redux';

import CurrentTrackExpanded from './CurrentTrackExpanded';
import CurrentTrackCollapsed from './CurrentTrackCollapsed';
import CurrentTrackNoMusic from './CurrentTrackNoMusic';

import {
    getCurrentTrack,
    getNextTrack
} from '../selectors/CurrentTrackSelectors';

import { toggleExpanded } from '../reduxActions/CurrentTrackActions';

const mapStateToProps = state => {
    return {
        expanded: state.currentTrack.expanded,
        nextTrack: getNextTrack(state),
        currentTrack: getCurrentTrack(state)
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleExpanded: expanded => dispatch(toggleExpanded(expanded))
    };
};

export function CurrentTrack(props) {
    const { currentTrack, toggleExpanded, expanded } = props;

    const toggle = () => {
        toggleExpanded(!expanded);
    };

    if (!currentTrack || !currentTrack.title) {
        return <CurrentTrackNoMusic {...props} toggle={toggle} />;
    }

    if (!expanded) {
        return <CurrentTrackCollapsed {...props} toggle={toggle} />;
    }

    return <CurrentTrackExpanded {...props} toggle={toggle} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(CurrentTrack);
