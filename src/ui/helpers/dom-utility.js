export function getClosest(elem, selector) {
	let el;

	for (let n = elem ; n; n = n.parentNode) {
		el = n;
		if ( n.webkitMatchesSelector(selector)) {
			return el;
		}
	}
};
