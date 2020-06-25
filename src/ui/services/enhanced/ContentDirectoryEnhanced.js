import _ from 'lodash';
import { Helpers, Services } from 'sonos';

export default class ContentDirectoryEnhanced extends Services.ContentDirectory {
    _enumItems(resultcontainer) {
        if (resultcontainer === undefined) {
            return;
        }

        if (!Array.isArray(resultcontainer)) {
            resultcontainer = [resultcontainer];
        }

        const convertItem = function (item) {
            const res = Helpers.ParseDIDLItem(
                item,
                this.host,
                this.port,
                _.get(item, 'res._')
            );

            return {
                ...res,
                class: item['upnp:class'],
                _raw: {
                    ...item,
                },
            };
        }.bind(this);

        return resultcontainer.map(convertItem);
    }

    /*
    See: http://docs.python-soco.com/en/latest/api/soco.music_library.html#soco.music_library.MusicLibrary.album_artist_display_option

    Possible values are:
    'WMP' - use Album Artists
    'ITUNES' - use iTunes® Compilations
    'NONE' - do not group compilations
    */
    GetSearchCapabilities = async () => {
        return this._request('GetSearchCapabilities', {}).then(
            (r) => r.SearchCaps
        );
    };

    GetSortCapabilities = async () => {
        return this._request('GetSortCapabilities', {}).then((r) => r.SortCaps);
    };

    GetSystemUpdateID = async () => {
        return this._request('GetSystemUpdateID', {}).then((r) => r.Id);
    };

    GetAlbumArtistDisplayOption = async () => {
        return this._request('GetAlbumArtistDisplayOption', {}).then(
            (r) => r.AlbumArtistDisplayOption
        );
    };

    GetLastIndexChange = async () => {
        return this._request('GetLastIndexChange', {}).then(
            (r) => r.LastIndexChange
        );
    };

    FindPrefix = async (ObjectID, Prefix) => {
        return this._request('FindPrefix', {
            ObjectID,
            Prefix,
        });
    };

    GetAllPrefixLocations = async (ObjectID) => {
        return this._request('GetAllPrefixLocations', {
            ObjectID,
        });
    };

    CreateObject = async (ContainerID, Elements) => {
        return this._request('CreateObject', {
            ContainerID,
            Elements,
        });
    };

    UpdateObject = async (ObjectID, CurrentTagValue) => {
        return this._request('UpdateObject', {
            ObjectID,
            CurrentTagValue,
        });
    };

    DestroyObject = async (ObjectID) => {
        return this._request('DestroyObject', {
            ObjectID,
        });
    };

    RefreshShareIndex = async (AlbumArtistDisplayOption = '') => {
        return this._request('RefreshShareIndex', {
            AlbumArtistDisplayOption,
        });
    };

    RequestResort = async (SortOrder) => {
        return this._request('RequestResort', {
            SortOrder,
        });
    };

    GetShareIndexInProgress = async () => {
        return this._request('GetShareIndexInProgress', {}).then(
            (r) => r.IsIndexing !== '0'
        );
    };

    GetBrowseable = async () => {
        return this._request('GetBrowseable', {}).then(
            (r) => r.IsBrowseable !== '0'
        );
    };

    SetBrowseable = async (Browseable) => {
        return this._request('SetBrowseable', {
            Browseable,
        });
    };
}
