import { h, Component } from 'preact';

const EVENT_OPTS = {
	passive: true
};

/** Virtual list, renders only visible items.
 *	@param {Number} rowHeight	  		Use a static height value for each row. Prevents relayout.
 *	@param {Number} defaultRowHeight	Initial row height, used prior to height being calculated from first item
 *	@param {Number} [overscan=10]		Amount of rows to render above and below visible area of the list
 *	@param {Boolean} [sync=false]		true forces synchronous rendering
 *	@example
 *		<ScrollViewport
 *			rowHeight={22}
 *			defaultRowHeight={22}
 *			sync
 *		/>
 */
export default class ScrollViewport extends Component {
	resized = () => {
		let height = window.innerHeight || document.documentElement.offsetHeight;
		if (height!==this.state.height) {
			this.setState({ height });
		}
	};

	scrolled = () => {
		let offset = Math.max(0, this.base && -this.base.getBoundingClientRect().top || 0);
		this.setState({ offset });
		if (this.props.sync) this.forceUpdate();
	};

	computeRowHeight() {
		if (this._height) return this._height;
		let first = this.base && this.base.firstElementChild && this.base.firstElementChild.firstElementChild;
		return this._height = (first && first.offsetHeight || 0);
	}

	componentDidUpdate() {
		this.resized();
	}

	componentDidMount() {
		this.resized();
		this.scrolled();

		let scrollEventHolder = (this.props.scroll) ? document.querySelector(this.props.scroll) : window;

		addEventListener('resize', this.resized, EVENT_OPTS);
		scrollEventHolder.addEventListener('scroll', this.scrolled, EVENT_OPTS);
	}

	componentWillUnmount() {
		let scrollEventHolder = (this.props.scroll) ? document.querySelector(this.props.scroll) : window;

		removeEventListener('resize', this.resized, EVENT_OPTS);
		scrollEventHolder.removeEventListener('scroll', this.scrolled, EVENT_OPTS);
	}

	render({ overscan=10, rowHeight, defaultRowHeight, children, ...props }, { offset=0, height=0 }) {
		rowHeight = rowHeight || this.computeRowHeight() || defaultRowHeight || 100;

		// compute estimated height based on first item height and number of items:
		let estimatedHeight = rowHeight * children.length;
		if (typeof props.style==='string') {
			props.style += ' height:'+estimatedHeight+'px;';
		}
		else {
			(props.style || (props.style={})).height = estimatedHeight.toExponential() + 'px';
		}

		let start = 0,
			visibleRowCount = 1;

		if (rowHeight) {
			// first visible row index
			start = (offset / rowHeight)|0;

			// actual number of visible rows (without overscan)
			visibleRowCount = (height / rowHeight)|0;

			// Overscan: render blocks of rows modulo an overscan row count
			// This dramatically reduces DOM writes during scrolling
			if (overscan) {
				start = Math.max(0, start - (start % overscan));
				visibleRowCount += overscan;
			}
		}

		// last visible + overscan row index
		let end = start + 1 + visibleRowCount;

		// children currently in viewport plus overscan items
		let visible = children.slice(start, end);

		return (
			<div {...props}>
				<div style={{ position: 'relative', top: start*rowHeight }}>
					{visible}
				</div>
			</div>
		);
	}
}
