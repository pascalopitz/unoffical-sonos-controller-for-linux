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
}
