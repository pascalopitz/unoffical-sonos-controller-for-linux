"use strict";

export default {
	asc: function sortAsc(m1, m2) {
		if(m1.$.ZoneName > m2.$.ZoneName) {
			return 1;
		}

		if(m1.$.ZoneName < m2.$.ZoneName) {
			return -1;
		}

		return 0;
	}
};