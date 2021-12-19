import _ from 'lodash';
import { Helpers } from 'sonos';

const SERVICE_LOGOS_URI =
    'http://update-services.sonos.com/services/mslogo.xml';

let ServiceImageMap;

export function initialise() {
    return fetch(SERVICE_LOGOS_URI)
        .then((res) => res.text())
        .then(async (res) => {
            const xml = await Helpers.ParseXml(res);
            ServiceImageMap = xml.images;
        });
}

export default function getServiceLogoUrl(id) {
    if (!id) {
        return;
    }

    const encodedId = String(7 + Number(id) * 256);
    const match = _.find(
        ServiceImageMap['acr-hdpi'].service,
        (i) => _.get(i, 'id') === encodedId
    );

    return _.get(match, 'image._');
}
