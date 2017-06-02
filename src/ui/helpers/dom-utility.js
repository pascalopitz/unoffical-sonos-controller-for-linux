export function getClosest(elem, selector) {
    let el;

    for (let n = elem; n; n = n.parentNode) {
        el = n;
        if ( n && n.webkitMatchesSelector && n.webkitMatchesSelector(selector)) {
            return el;
        }
    }

    return null;
}
