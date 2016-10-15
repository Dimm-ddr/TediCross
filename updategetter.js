'use strict';

const EventEmitter = require('events').EventEmitter;

const updateGetter = function updateGetter (bot, timeout = 60) {
	const emitter = new EventEmitter();
	let stop = false;
	emitter.stopUpdates = () => { stop = true; };
	let offset = 0;

	const fetchUpdates = () => {
		bot.getUpdates(offset ? { timeout, offset } : { timeout })
			.then(handleUpdates)
			.catch(err => console.error(`${err.name}: ${err.message}`));
	};

	const handleUpdates = updates => {
		updates.forEach(update => {
			if (offset <= update.update_id) {
				offset = update.update_id + 1;
			}
			emitter.emit('update', update);
			if (typeof update.message !== 'undefined') {
				emitter.emit('message', update.message);
			}
			if (typeof update.message.text !== 'undefined') {
				emitter.emit('text', update.message);
			}
			if (!stop) setTimeout(fetchUpdates);
		});
	};
	for (let k in emitter) {
		bot[k] = typeof emitter[k] === 'function' ? emitter[k].bind(emitter) : emitter[k];
	}

	fetchUpdates();

	return bot;
};

module.exports = updateGetter;
