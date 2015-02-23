import EventableMixin from './EventableMixin';
import { Cursor, ImmutableOptimizations }  from 'react-cursor';

var opt = ImmutableOptimizations(['cursor']);

class ImmutableMixin extends EventableMixin {
	shouldComponentUpdate() {
		return opt.shouldComponentUpdate.apply(this, arguments);
	}
}

export default ImmutableMixin; 