export function getClosest(elem, selector) {
    let el;

    for (let n = elem; n; n = n.parentNode) {
        el = n;
        if (n && n.webkitMatchesSelector && n.webkitMatchesSelector(selector)) {
            return el;
        }
    }

    return null;
}

export function createIntersectionObserver(node, options, callback) {
    const observer = new IntersectionObserver(callback, options);
    observer.observe(node);
    return observer;
}

export function purgeIntersectionObserver(observer) {
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    return null;
}
