"use strict";

import _ from 'lodash';
import request from '../sonos/helpers/request';

const MAX_CONNECTIONS = 2;

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

		request({
			method: 'GET',
			url: url,
			responseType: 'blob',
		}, (err, meta, response) => {
			connections--;

			pending[url].forEach((p) => {
				if(err !== null) {
					cache[url] = false;
					p.reject(response);
				} else {
					let reader = new FileReader();
					reader.onloadend = (data) => {
						cache[url] = data.currentTarget.result;
						p.resolve(data.currentTarget.result);
					};
					reader.readAsDataURL(response);
				}
			});
			delete pending[url];

			if(heap.length) {
				this.start();
			}
		});
	},

	add(url) {
		if(!url) {
			return Promise.reject(false);
		}

		if(cache[url]) {
			return Promise.resolve(cache[url]);
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
