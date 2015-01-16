var observers = [];

var model = {
	currentZone: null,
	zoneGroups: [],

	observe: function (prop, callback) {
		observers.push({
			prop: prop,
			callback: callback
		})
	}
}

Object.observe(model, function (changes) {
	changes.forEach(function (change) {
		observers.forEach(function (observer) {
			if(change.name === observer.prop) {
				observer.callback();
			}
		});
	});
});

export default model;