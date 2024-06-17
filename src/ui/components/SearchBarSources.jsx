import React from 'react';

export default function SearchBarSources({ sources, currentState = {} }) {
    let source = sources.find((s) => !s.client);

    if (currentState.serviceClient) {
        source = sources.find(
            (s) =>
                s.client &&
                currentState.serviceClient &&
                s.client.service.Id ===
                    currentState.serviceClient._serviceDefinition.Id,
        );
    }

    if (source) {
        return (
            <div className="search-bar-source">
                <img src={source.logo} className="search-bar-source-logo" />
                {source.label}
            </div>
        );
    }

    return null;
}
