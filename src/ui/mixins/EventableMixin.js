var events = require("bloody-events");
var e = events.create();

export default {
	trigger: function() {
		e.emit.apply(e, arguments);
	},

	subscribe: function () {
		e.on.apply(e, arguments);
	}
};