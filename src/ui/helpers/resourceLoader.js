import _ from 'lodash';
import request from '../sonos/helpers/request';

const MAX_CONNECTIONS = 5;

let heap = [];
let pending = {};
let connections = 0;
let cache = {};

export default {
	start() {
		if(!heap.length || connections >= MAX_CONNECTIONS) {
			return;
		}

		connections++;
		let url = heap.shift();
		let img = new Image();
		img.src = url;

		let tryNext = () => {
			connections--;
			delete pending[url];
			if(heap.length) {
				this.start();
			}
		}

		img.addEventListener('load', () => {
			pending[url].forEach((p) => {
				cache[url] = true;
				p.resolve(url);
			});
			tryNext();
		});

		img.addEventListener('error', () => {
			pending[url].forEach((p) => {
				cache[url] = false;
				p.reject(url);
			});
			tryNext()
		});

	},

	add(url) {
		if(!url) {
			return Promise.reject(false);
		}

		if(cache[url]) {
			return Promise.resolve(url);
		} else if(cache[url] === false) {
			return Promise.reject(false);
		}

		if(!pending[url]) {
			pending[url] = [];
			heap.push(url);
		}

		let p = new Promise((resolve, reject) => {
			pending[url].push({
				resolve,
				reject,
			});
		});

		return p;
	},

	remove(p, url) {
		pending[url] = _.without(pending[url], p);
	}
};
