var model = {
	currentZone: null,
	zoneGroups: [],

	observe: function (prop, callback) {
		Object.observe(model, function (changes) {
			if(changes[0].name === prop) {
				callback();
			}
		});
	}
}

export default model;