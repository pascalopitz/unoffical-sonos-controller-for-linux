import { h } from 'preact';
import { connect } from 'preact-redux';

import { getHasCurrent } from '../selectors/LoaderSelectors';

const mapStateToProps = state => {
    return {
        hasCurrent: getHasCurrent(state)
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
