'use strict';

/*!
 *	WIREWAX VIDEO HELPER
 *
 *	1.00
 *
 *	author: Carlo J. Santos
 *	email: carlosantos@gmail.com
 *	documentation: 
 *
 *	Copyright (c) 2018, All Rights Reserved, www.nargalzius.com
 */

function WireWaxPlayer() {}

WireWaxPlayer.prototype = {
	debug: false,
	params: {},
	default_params: {
		id: 'video',
		src: '//embed.wirewax.com/8022625/7bafa8/',
		width: 533,
		height: 300,
		duration: 110.97254,
		player: 'ww',
		autoplay: false,
		startmuted: false,
		cover: true,
		chromeless: false
	},
	api: false,
	playhead: 0,
	volume: -1,
	update_int: 300,
	flag_paused: false,
	flag_playing: false,
	flag_finished: false,
	flag_widget: false,
	flag_stopping: false,
	flag_ready: false,
	flag_vol_nonce: true,
	flag_vol_mute: false,
	load_int: null,
	init_int: null,
	prog_int: null,
	proxy: null,
	dom_container: null,

	evaluate: function evaluate(params) {

		this.flag_playing = false;
		this.playhead = null;
		this.duration = null;

		if (Object.keys(this.params).length === 0 && this.params.constructor === Object) Object.assign(this.params, this.default_params);

		if (params && params.constructor === Object) {
			for (var key in params) {
				this.params[key] = params[key];
			}if (!params.src) delete this.params['src'];
		} else if (params && params.constructor === String) {
			this.params.src = params;
		} else if (params && params.constructor === Boolean) {} else {
			delete this.params['src'];
		}

		if (!this.dom_container) this.dom_container = document.getElementById(this.params.id);

		if (this.dom_container.offsetWidth > 0 && this.dom_container.offsetHeight > 0) {
			this.params.width = this.dom_container.offsetWidth;
			this.params.height = this.dom_container.offsetHeight;
		}
	},
	init: function init(params) {
		var _this = this;

		if (window['wirewax']) {

			clearInterval(this.init_int);

			this.api = true;

			this.evaluate(params);

			// this.trace(this.params, 'params (init)');
			if (this.params.src) this.load(params);
		} else {
			this.init_int = setTimeout(function () {
				_this.init(params);
			}, 500);
		}
	},
	load: function load(params) {
		var _this2 = this;

		if (this.api) {

			clearInterval(this.load_int);

			if (this.proxy) {
				this.destroy();
				setTimeout(function () {
					_this2.load(params);
				}, 500);
				return;
			}

			this.evaluate(params);

			this.trace(this.params, 'params (load)');
			var extras = '?player=' + this.params.player + '&autoplay=' + this.params.autoplay + '&muted=' + this.params.startmuted + '&skin=' + (this.params.chromeless ? 'SkinBarebonesSlick' : 'SkinDefaultSlick');

			if (this.params.cover) extras += '&fullBleed=true';

			this.proxy = document.createElement('iframe');
			this.proxy.id = "proxy_" + this.params.id;
			this.proxy.width = this.params.width + 'px';
			this.proxy.height = this.params.height + 'px';
			this.proxy.src = this.params.src + extras;
			this.proxy.frameborder = '0';

			this.dom_container.appendChild(this.proxy);

			for (var key in window.wirewax.events.listeners) {
				window.wirewax.addEventListener(window.wirewax.events.listeners[key], function (e) {
					_this2.eventHandler(e);
				});
			}

			window.wirewax.playerId = 'proxy_' + this.params.id;
		} else {
			this.load_int = setTimeout(function () {
				_this2.load(params);
			}, 500);
		}
	},
	eventHandler: function eventHandler(e) {

		// if(e.name != 'returnCurrentTime')
		// 	this.trace(e);

		switch (e.name) {
			case "playerReady":
				this.flag_ready = true;
				this.callback_ready();
				// this.proxy = this.dom_container.getElementsByTagName('video')[0];
				// trace(this.dom_container.getElementsByTagName('video')[0]);
				break;
			case "hasPlayed":
				if (!this.flag_playing || this.flag_paused) {
					if (this.flag_paused) this.track_play();

					this.flag_playing = true;
					this.flag_paused = false;
					this.startProgress();
					this.callback_play();
				}
				break;
			case "videoEnd":
				this.stopProgress();
				trace('video duration: ' + this.playhead);
				this.track_end();
				this.callback_end();
				this.resetTracking();
				this.flag_paused = false;
				this.flag_finished = true;

				break;
			case "hasPaused":

				if (!this.flag_paused && this.flag_playing && !this.flag_stopping) {
					this.stopProgress();
					this.track_pause();
					this.callback_pause();
					this.flag_paused = true;
				}
				break;
			case "hasSeeked":
				if (!this.flag_paused) this.startProgress();
				break;
			case "volumeChange":

				if (e.data.volume != this.volume) {

					if (this.volume == 0) {
						this.track_unmute();
						this.callback_volume();
					} else if (e.data.volume == 0) {
						if (this.playhead > 0 && !this.flag_vol_nonce && !this.flag_vol_mute) {
							this.track_mute();
							this.callback_volume();
						} else {
							this.flag_vol_mute = false;
						}
					}

					this.volume = e.data.volume;
				} else {
					if (this.flag_vol_nonce) {
						this.volume = 1;
						this.setVolume(1);
						this.flag_vol_nonce = false;
						this.flag_vol_mute = true;
					}
				}

				break;
			case "returnCurrentTime":
				this.playhead = e.data.currentTime;

				var phpercentage = this.playhead / this.params.duration * 100;

				if (this.track.started !== true && phpercentage > 0) {
					this.track.started = true;

					if (this.flag_finished) this.track_replay();else this.track_start();
				}

				if (this.track.q25 !== true && phpercentage >= 25) {
					this.track.q25 = true;
					this.track_q25();
				}

				if (this.track.q50 !== true && phpercentage >= 50) {
					this.track.q50 = true;
					this.track_q50();
				}

				if (this.track.q75 !== true && phpercentage >= 75) {
					this.track.q75 = true;
					this.track_q75();
				}

				// trace(this.playhead);

				this.callback_progress();
				break;

			case "scormEvent":

				break;
			case "renditionChanged":

				break;
			case "widgetClosed":
				if (this.flag_widget) {
					this.track_tagClose();
					this.flag_widget = false;
				}
				break;
			case "widgetShown":
				this.flag_widget = true;
				trace(e);
				this.track_tagOpen();
				break;
			case "clientCustomEvent":

				break;
			case "tagClick":
				// this.track_tagClick();
				break;

			case "addToCart":
				this.callback_cart(e.data);
				break;

			default:
				this.trace('nada');
		}
	},
	startProgress: function startProgress() {
		var _this3 = this;

		this.stopProgress();

		this.prog_int = setInterval(function () {
			_this3.updateHander();
		}, this.update_int);
	},
	stopProgress: function stopProgress() {
		clearInterval(this.prog_int);
	},
	updateHander: function updateHander() {
		if (this.api && this.flag_ready) window.wirewax.triggerEvent(window.wirewax.events.triggers.GET_CURRENT_TIME);

		if (this.flag_stopping) this.stopBatch();
	},


	track: {
		started: false,
		q25: false,
		q50: false,
		q75: false
	},

	resetTracking: function resetTracking() {
		this.playhead = 0;
		this.track.started = false;
		this.track.q25 = false;
		this.track.q50 = false;
		this.track.q75 = false;
		this.flag_playing = false;
		this.flag_paused = false;
	},
	track_start: function track_start() {
		this.trace('------------------ track_start');
	},
	track_stop: function track_stop() {
		this.trace('------------------ track_stop');
	},
	track_end: function track_end() {
		this.trace('------------------ track_end');
	},
	track_play: function track_play() {
		this.trace('------------------ track_play');
	},
	track_replay: function track_replay() {
		this.trace('------------------ track_replay');
	},
	track_pause: function track_pause() {
		this.trace('------------------ track_pause');
	},
	track_mute: function track_mute() {
		this.trace('------------------ track_mute');
	},
	track_unmute: function track_unmute() {
		this.trace('------------------ track_unmute');
	},
	track_q25: function track_q25() {
		this.trace('------------------ track_q25');
	},
	track_q50: function track_q50() {
		this.trace('------------------ track_q50');
	},
	track_q75: function track_q75() {
		this.trace('------------------ track_q75');
	},
	track_tagOpen: function track_tagOpen() {
		this.trace('------------------ track_tagOpen');
	},
	track_tagClose: function track_tagClose() {
		this.trace('------------------ track_tagClose');
	},
	track_tagSeek: function track_tagSeek() {
		this.trace('------------------ track_tagSeek');
	},

	// track_tagClick()		{ this.trace('------------------ track_tagClick'); },

	callback_progress: function callback_progress() {/* this.trace('------------------ callback_progress'); */},
	callback_ready: function callback_ready() {
		this.trace('------------------ callback_ready');
	},
	callback_end: function callback_end() {
		this.trace('------------------ callback_end');
	},
	callback_play: function callback_play() {
		this.trace('------------------ callback_play');
	},
	callback_error: function callback_error() {
		this.trace('------------------ callback_error');
	},
	callback_stop: function callback_stop() {
		this.trace('------------------ callback_stop');
	},
	callback_pause: function callback_pause() {
		this.trace('------------------ callback_pause');
	},
	callback_show: function callback_show() {
		this.trace('------------------ callback_show');
	},
	callback_volume: function callback_volume() {
		this.trace('------------------ callback_volume');
	},
	callback_cart: function callback_cart(data) {
		this.trace('------------------ callback_cart');
	},
	play: function play() {
		if (this.api && this.flag_ready && !this.flag_widget) {
			if (this.flag_playing && this.flag_paused || !this.flag_playing && !this.flag_paused) window.wirewax.triggerEvent(window.wirewax.events.triggers.PLAY);
		} else if (this.flag_widget) {
			this.tagClose();
		}
	},
	pause: function pause() {
		if (this.flag_playing && !this.flag_paused && !this.flag_widget) if (this.api && this.flag_ready) window.wirewax.triggerEvent(window.wirewax.events.triggers.PAUSE);
	},
	stop: function stop() {
		if (this.flag_playing) {
			if (this.flag_widget) {
				this.flag_stopping = true;
				this.tagClose();
			} else {
				this.stopBatch();
			}
		}
	},
	stopBatch: function stopBatch() {
		this.flag_stopping = true;

		this.stopProgress();
		this.pause();
		this.seek(0);
		this.resetTracking();
		this.track_stop();
		this.callback_stop();

		this.flag_stopping = false;
	},
	seek: function seek(num) {
		if (this.api && this.flag_ready && !this.flag_widget) {
			this.stopProgress();
			window.wirewax.triggerEvent(window.wirewax.events.triggers.SEEK, num);
		}
	},
	getTime: function getTime() {
		return this.playhead;
	},
	isPlayerReady: function isPlayerReady() {
		if (this.api && this.flag_ready) window.wirewax.triggerEvent(window.wirewax.events.triggers.IS_PLAYER_READY);
	},
	tagSeek: function tagSeek(num) {
		if (this.api && this.flag_ready && !this.flag_widget) {
			window.wirewax.triggerEvent(window.wirewax.events.triggers.GO_TO_TAG, num);
			this.track_tagSeek();
		}
	},
	tagOpen: function tagOpen(num) {
		if (this.api && this.flag_ready && !this.flag_widget) {
			window.wirewax.triggerEvent(window.wirewax.events.triggers.OPEN_TAG, num);
		}
	},
	tagClose: function tagClose() {
		if (this.api && this.flag_ready && this.flag_widget) window.wirewax.triggerEvent(window.wirewax.events.triggers.CLOSE_WIDGET);
	},
	mute: function mute() {
		if (this.api && this.flag_ready && !this.flag_widget) window.wirewax.triggerEvent(window.wirewax.events.triggers.MUTE_VOLUME);
	},
	unmute: function unmute() {
		if (this.api && this.flag_ready && !this.flag_widget) window.wirewax.triggerEvent(window.wirewax.events.triggers.UNMUTE_VOLUME);
	},
	setVolume: function setVolume(num) {
		if (this.api && this.flag_ready && !this.flag_widget) window.wirewax.triggerEvent(window.wirewax.events.triggers.CHANGE_VOLUME, num);
	},


	// custom() {
	// 	if(this.api && this.flag_ready) window.wirewax.triggerEvent(window.wirewax.events.triggers., data);
	// },

	resetVariables: function resetVariables() {},
	resetPlayback: function resetPlayback() {},
	destroy: function destroy() {
		this.stop();
		this.stopProgress();
		this.dom_container.innerHTML = '';
		this.proxy = null;

		this.params = {};
		this.volume = -1;
		this.flag_paused = false;
		this.flag_playing = false;
		this.flag_finished = false;
		this.flag_widget = false;
		this.flag_stopping = false;
		this.flag_ready = false;
	},
	trace: function trace(str, str2) {
		if (this.debug) {

			if (window.console) {
				window.console.log(str, str2 ? str2 : '');
			}

			if (this.dom_debug) {
				this.dom_debug.innerHTML += (str2 ? str2 + ': ' : '') + str + '<br>';
			}
		}
	},
	listEvents: function listEvents() {
		for (var key in window.wirewax.events.listeners) {
			console.log(window.wirewax.events.listeners[key]);
		}
	}
};

if (!window['wirewax']) {
	var checkDebug = window['console'] && window['debug'] ? true : false;

	// NO API YET, LOAD MANUALLY
	if (checkDebug) console.log('LOADING WireWax API');

	var loadFunction = function loadFunction() {
		if (typeof window.EventBus != 'undefined') EventBus.dispatch("MAP_LOADED", window);
		if (checkDebug) console.log('WireWax API loaded');
	};

	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src = 'https://edge-player.wirewax.com/ww4release/javascripts/wirewax-iframe-api.js';
	s.addEventListener("load", loadFunction, false);

	var head = document.getElementsByTagName("head")[0];
	head.appendChild(s);
}
