import React from 'react';
import { connect } from 'react-redux';

import { getHasCurrent } from '../../common/selectors/LoaderSelectors';

const mapStateToProps = (state) => {
    return {
        hasCurrent: getHasCurrent(state),
    };
};

const mapDispatchToProps = () => {
    return {};
};

export function Loader(props) {
    if (props.hasCurrent) {
        return null;
    }

    return (
        <div id="loader">
            <p>Searching for your Sonos System ...</p>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Loader);
