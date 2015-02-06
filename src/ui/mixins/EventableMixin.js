import e from '../events';

export default {
	trigger: function() {
		e.emit.apply(e, arguments);
	},

	subscribe: function () {
		e.on.apply(e, arguments);
	}
};
