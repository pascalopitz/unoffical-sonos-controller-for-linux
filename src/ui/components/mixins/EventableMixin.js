import e from '../../helpers/events';
import React from 'react/addons';

class EventableMixin extends React.Component {
	trigger () {
		e.emit.apply(e, arguments);
	}

	subscribe () {
		e.on.apply(e, arguments);
	}
};

export default EventableMixin;