import _ from 'lodash';
import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

import SonosService from '../services/SonosService';

import BrowserListStore from '../stores/BrowserListStore';

function createSearchPromise(type, term, options) {
    return new Promise(resolve => {
        term = escape(term);

        const sonos = SonosService._currentDevice;
        sonos.searchMusicLibrary(type, term, options || {}, (err, result) => {
            if (err) {
                resolve({
                    returned: 0,
                    total: 0,
                    items: []
                });
                return;
            }

            resolve(
                _.assign(result, {
                    type,
                    term,
                    search: true
                })
            );
        });
    });
}

function transformSMAPI(res, client) {
    const items = [];

    if (res.mediaMetadata) {
        if (!Array.isArray(res.mediaMetadata)) {
            res.mediaMetadata = [res.mediaMetadata];
        }

        res.mediaMetadata.forEach(i => {
            i.serviceClient = client;
            items[i.$$position] = i;
        });
    }

    if (res.mediaCollection) {
        if (!Array.isArray(res.mediaCollection)) {
            res.mediaCollection = [res.mediaCollection];
        }

        res.mediaCollection.forEach(i => {
            i.serviceClient = client;
            items[i.$$position] = i;
        });
    }

    return {
        returned: res.count,
        total: res.total,
        items: items
    };
}

export default {
    term: null,

    search(term) {
        this.term = term;

        if (!term || !term.length) {
            Dispatcher.dispatch({
                actionType: Constants.SEARCH,
                term: ''
            });
            return;
        }

        const currentState = BrowserListStore.getState();

        if (currentState.serviceClient) {
            const client = currentState.serviceClient;
            const serviceId = Number(client._serviceDefinition.Id);

            let chain;

            if (serviceId === 160) {
                chain = Promise.all([
                    Promise.resolve([]),
                    client.search('search:people', term),
                    client.search('search:sounds', term)
                ]);
            } else {
                chain = Promise.all([
                    client.search('album', term),
                    client.search('artist', term),
                    client.search('track', term)
                ]);
            }

            chain.then(
                res => {
                    if (this.term !== term) {
                        return;
                    }

                    Dispatcher.dispatch({
                        actionType: Constants.SEARCH,
                        term: term,
                        results: {
                            albums: transformSMAPI(res[0], client),
                            artists: transformSMAPI(res[1], client),
                            tracks: transformSMAPI(res[2], client)
                        }
                    });
                },
                () => {
                    //debugger;
                }
            );
        } else {
            Promise.all([
                createSearchPromise('albums', term),
                createSearchPromise('albumArtists', term),
                createSearchPromise('tracks', term)
            ]).then(
                res => {
                    if (this.term !== term) {
                        return;
                    }

                    Dispatcher.dispatch({
                        actionType: Constants.SEARCH,
                        term: term,
                        results: {
                            albums: res[0],
                            artists: res[1],
                            tracks: res[2]
                        }
                    });
                },
                () => {
                    //debugger;
                }
            );
        }
    }
};
