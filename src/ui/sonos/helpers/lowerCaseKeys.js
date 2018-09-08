import _ from 'lodash';

export default function lowerCaseKeys(obj) {
    const out = {};

    for (const k of Object.keys(obj)) {
        out[_.camelCase(k)] = obj[k];
    }

    return out;
}
