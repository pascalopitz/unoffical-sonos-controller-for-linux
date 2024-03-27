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
        const match = ServiceImageMap.sized.service.find(
            (i) => i.id == encodedId
        );

        const square = (match?.image || []).find(
            (i) => i.placement === 'square'
        )?._;

        return square;
    } catch (e) {
        console.log(e);
    }
}
