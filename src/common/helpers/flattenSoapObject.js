export function flattenSoapObject(obj) {
    const out = {};
    for(const key of Object.keys(obj)) {
        if(obj[key]._) {
            out[key] = obj[key]._;
        } else {
            out[key] = obj[key];
        }
    }

    return out;
}