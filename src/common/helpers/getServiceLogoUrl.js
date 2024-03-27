import get from 'lodash/get';

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
    try {
        if (!id) {
            return;
        }

        const encodedId = String(7 + Number(id) * 256);
        const match = find(
            ServiceImageMap.presentationmap.service,
            (i) => get(i, 'id') === encodedId
        );
    
        const attBrandMark =  (match?.image || []).find(i => i.placement === 'AttributionBrandmark')?._;
        const brandLogo =  (match?.image || []).find(i => i.placement === 'BrandLogo-v2')?._;
    
        return attBrandMark || brandLogo;
    } catch (e) {
        console.log(e);
    }
}
