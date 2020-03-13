import React from 'react';

export default function CurrentTrackCollapsed(props) {
    const { expanded, toggle } = props;

    const toggleNode = expanded ? (
        <i className="material-icons">expand_less</i>
    ) : (
        <i className="material-icons">expand_more</i>
    );

    const expandClass = expanded ? 'expanded' : 'collapsed';

    return (
        <div className={expandClass}>
            <h4 id="now-playing">
                <span>No Music</span>

                <a
                    id="current-track-toggle-button"
                    className="current-track-toggle-button"
                    onClick={toggle}
                >
                    {toggleNode}
                </a>
            </h4>
        </div>
    );
}
