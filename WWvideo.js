/*!
 *	WIREWAX VIDEO HELPER
 *
 *	1.5
 *
 *	author: Carlo J. Santos
 *	email: carlosantos@gmail.com
 *	documentation: https://github.com/nargalzius/WWvideo
 *  demo: https://codepen.io/nargalzius/full/QxZWaq
 *	Copyright (c) 2018, All Rights Reserved, www.nargalzius.com
 */

/* eslint-disable no-console */
/* eslint comma-dangle: ["error", "only-multiline"] */

function WireWaxPlayer(){}

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
		chromeless: false,
		replaywithsound: true,
		continuecfs: true,
		overlay: false,
	},

	dom_container: null,
	dom_overlay: null,
	dom_play: null,
	dom_sound: null,
    dom_replay: null,

	svg: {
        play: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64" height="64" viewBox="0 0 24 24"><path fill="#444444" d="M12 20.016q3.281 0 5.648-2.367t2.367-5.648-2.367-5.648-5.648-2.367-5.648 2.367-2.367 5.648 2.367 5.648 5.648 2.367zM12 2.016q4.125 0 7.055 2.93t2.93 7.055-2.93 7.055-7.055 2.93-7.055-2.93-2.93-7.055 2.93-7.055 7.055-2.93zM9.984 16.5v-9l6 4.5z"></path></svg>',
        sound: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64" height="64" viewBox="0 0 24 24"><path fill="#444444" d="M14.016 3.234q3.047 0.656 5.016 3.117t1.969 5.648-1.969 5.648-5.016 3.117v-2.063q2.203-0.656 3.586-2.484t1.383-4.219-1.383-4.219-3.586-2.484v-2.063zM16.5 12q0 2.813-2.484 4.031v-8.063q2.484 1.219 2.484 4.031zM3 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6z"></path></svg>',
        replay: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64" height="64" viewBox="0 0 24 24"><path fill="#444444" d="M12 5.016q3.328 0 5.672 2.344t2.344 5.625q0 3.328-2.367 5.672t-5.648 2.344-5.648-2.344-2.367-5.672h2.016q0 2.484 1.758 4.242t4.242 1.758 4.242-1.758 1.758-4.242-1.758-4.242-4.242-1.758v4.031l-5.016-5.016 5.016-5.016v4.031z"></path></svg>',
    },

    colors_play: '#FFF',
    colors_sound: '#FFF',
    colors_replay: '#FFF',
    colors_bg: 'rgba(0,0,0,0.4)',

    dom_template_play() {
        this.dom_play = document.createElement('div');
        this.dom_play.style.backgroundColor = this.colors_bg;
        this.setVendor(this.dom_play, 'borderRadius', '32px');
        this.dom_play.innerHTML = this.svg.play;
        this.dom_play.getElementsByTagName('path')[0].style.fill = this.colors_play;
    },
    dom_template_sound() {
        this.dom_sound = document.createElement('div');
        this.dom_sound.style.backgroundColor = this.colors_bg;
        this.setVendor(this.dom_sound, 'borderRadius', '32px');
        this.dom_sound.innerHTML = this.svg.sound;
        this.dom_sound.getElementsByTagName('path')[0].style.fill = this.colors_sound;
    },
     dom_template_replay() {
        this.dom_replay = document.createElement('div');
        this.dom_replay.style.backgroundColor = this.colors_bg;
        this.setVendor(this.dom_replay, 'borderRadius', '32px');
        this.dom_replay.innerHTML = this.svg.replay;
        this.dom_replay.getElementsByTagName('path')[0].style.fill = this.colors_replay;
        this.dom_replay.getElementsByTagName('svg')[0].style.marginTop = '-5px';
    },

    overlayShow(el) {

    	this.dom_overlay.style.display = 'block';

    	let arr = [
    		this.dom_play, 
    		this.dom_replay, 
    		this.dom_sound,
    	];

    	el.style.display = 'block';

    	for(let i = 0; i < arr.length; i++) {
    		if( arr[i] !== el )
    			arr[i].style.display = 'none';
    	}

    	this.reflow(true);
    },

	api: false,
	playhead: 0,
	volume: -1,
	update_int: 300,
	dom_debug: null,
	flag_paused: false,
	flag_playing: false,
	flag_finished: false,
	flag_widget: false,
	flag_stopping: false,
	flag_ready: false,
	flag_vol_nonce: true,
	flag_vol_mute: false,
	flag_events: false,
	flag_overlay: false,
	load_int: null,
	init_int: null,
	prog_int: null,
	proxy: null,

    centered_controls: {},
	

	evaluate(params) {

		this.flag_playing = false;
		this.playhead = null;
		this.duration = null;

		if( Object.keys(this.params).length === 0 )
			for( let key in this.default_params ) 
				this.params[key] = this.default_params[key];

		if( params && params.constructor === Object ) {
			for( let key in params ) 
				this.params[key] = params[key];

			if(!params.src)
				delete this.params['src'];
		} else
		if( params && params.constructor === String ) {
			this.params.src = params;
		} else
		if( params && params.constructor === Boolean ) {
			// NADA
		} else {
			delete this.params['src'];
		}

		if(!this.dom_container)
			this.dom_container = document.getElementById(this.params.id);

		if( this.dom_container.offsetWidth > 0 && this.dom_container.offsetHeight > 0 ) {
			this.params.width = this.dom_container.offsetWidth;
			this.params.height = this.dom_container.offsetHeight;
		}

		// FORCE MUTESTATE BASED ON AUTOPLAY SETTINGS

		if(this.params.autoplay)
			this.params.startmuted = true;
		else
			this.params.startmuted = false;
	},

	checkParams(params) {

		if( params && params.constructor === Object && params.src && !params.duration ) {
			alert('params.duration needs to be defined when supplying a video src');
			return true;
		} else {
			return false;
		}
	},

	init(params) {

		if( window['wirewax'] ) {

			clearInterval(this.init_int);
			
			this.api = true;
			
			if( !this.checkParams(params) ) {

				this.evaluate(params);

				if( this.params.src ) 
					this.load(params);
				else
					this.trace(this.params, 'params (init)');
			}
		} else {
			this.init_int = setTimeout(() => { this.init(params); }, 500);
		}
	},

	load(params) {

		if(this.api) {

			clearInterval(this.load_int);

			if( params && params.constructor === Object && !this.checkParams(params) ) {

				this.unload();

				// 	setTimeout(()=>{

				this.evaluate(params);

				this.trace(this.params, 'params (load)');
				let extras = '?player=' +this.params.player
						   + '&autoplay=' +this.params.autoplay
						   + '&muted=' + this.params.startmuted
						   + '&skin=' + ( this.params.chromeless ? 'SkinBarebonesSlick' : 'SkinDefaultSlick' )
						   + '&fullBleed=' + this.params.cover;

				this.proxy = document.createElement('iframe');
				this.proxy.id = "proxy_"+this.params.id;
				this.proxy.width = this.params.width + 'px';
				this.proxy.height = this.params.height + 'px';
				this.proxy.src = this.params.src + extras;
				this.proxy.setAttribute('frameborder', '0');

				this.dom_container.appendChild(this.proxy);

				if(!this.flag_events)
					this.setListeners();

				this.flag_events = true;
				
				window.wirewax.playerId = 'proxy_'+this.params.id;

				// 	}, 500);

			} else {
				alert('load() method requires parameter object');
			}

		} else {
			this.load_int = setTimeout(() => { this.load(params); }, 500);
		}
	},

	setupOverlay() {

		this.dom_overlay = document.createElement('div');
		this.dom_overlay.className = 'wwOverlay';
		this.dom_overlay.style.position = 'absolute';
		this.dom_overlay.style.top = '0';
		this.dom_overlay.style.left = '0';
		this.dom_overlay.style.width = '100%';
		this.dom_overlay.style.height = '100%';

		// BIG BUTTONS
        this.dom_template_play();
        this.addClass(this.dom_play, 'cbtn');
        this.addClass(this.dom_play, 'v_control_bb');
        this.addClass(this.dom_play, 'play');
        this.dom_play.style.zIndex = this.zindex + 2;
        this.dom_play.style.display = 'block';
        this.dom_play.style.position = 'absolute';
        this.dom_play.style.cursor = 'pointer';
        this.dom_overlay.appendChild(this.dom_play);
        this.dom_play.style.display = 'none';
        this.centered_controls.play = this.dom_play;

        this.dom_template_sound();
        this.addClass(this.dom_sound, 'cbtn');
        this.addClass(this.dom_sound, 'v_control_bb');
        this.addClass(this.dom_sound, 'sound');
        this.dom_sound.style.zIndex = this.zindex + 2;
        this.dom_sound.style.display = 'block';
        this.dom_sound.style.position = 'absolute';
        this.dom_sound.style.cursor = 'pointer';
		this.dom_overlay.appendChild(this.dom_sound);
        this.dom_sound.style.display = 'none';
        this.centered_controls.sound = this.dom_sound;

        if(this.params.uniquereplay) {
            this.dom_template_replay();
        } else {
            this.dom_replay = this.dom_play.cloneNode(true);
            this.removeClass(this.dom_replay, 'play');
        }
        this.addClass(this.dom_replay, 'cbtn');
        this.addClass(this.dom_replay, 'v_control_bb');
        this.addClass(this.dom_replay, 'replay');
        this.dom_replay.id = 'replay_btn'
        this.dom_replay.style.zIndex = this.zindex + 2;
        this.dom_replay.style.display = 'block';
        this.dom_replay.style.position = 'absolute';
        this.dom_replay.style.cursor = 'pointer';
        this.dom_overlay.appendChild(this.dom_replay);
        this.dom_replay.style.display = 'none';
        this.centered_controls.replay = this.dom_replay;

        let _handler = (e) => {
        	this.eventHandler(e);
        };

        this.dom_overlay.addEventListener('click', _handler, false );
        this.dom_play.addEventListener('click', _handler, false );
		this.dom_sound.addEventListener('click', _handler, false );
		this.dom_replay.addEventListener('click', _handler, false );

		this.trace(this.dom_container, 'READY');
		
        this.dom_container.appendChild(this.dom_overlay);

        this.flag_overlay = true;
        this.reflow(true);
	},

	eventHandler(e) {

		// if(e.name != 'returnCurrentTime')
		// 	this.trace(e);

		switch(e.name) {
			case 'playerReady':
				if(!this.flag_ready) {
					this.flag_ready = true;
					this.flag_vol_nonce = true;
					this.callback_ready();

					if( this.params.chromeless && this.params.overlay ) {
						this.setupOverlay();
					}
				}
			break;
			case 'hasPlayed':
				if(!this.flag_playing || this.flag_paused) {
					if(this.flag_paused)
						this.track_play();

					this.flag_playing = true;
					
					this.startProgress();

					if(this.flag_paused)
						this.callback_play();

					this.flag_paused = false;					
				}
			break;
			case 'videoEnd':
				this.stopProgress();
				this.trace('video duration: '+this.playhead);
				this.track_end();
				this.callback_end();
				this.resetTracking();
				this.flag_paused = false;
				this.flag_finished = true;
				this.params.continuecfs = true;

				if(this.params.replaywithsound) {
					this.volume = 1;
					this.setVolume(1);
					this.flag_vol_mute = false;
				}

				if(this.params.chromeless && this.params.overlay) {
					this.overlayShow(this.dom_replay);
				}

			break;
			case 'hasPaused':

				if( !this.flag_paused && this.flag_playing && !this.flag_stopping ) {
					this.stopProgress();
					this.track_pause();
					this.callback_pause();
					this.flag_paused = true;
				}
			break;
			case 'hasSeeked':
				if( !this.flag_paused )
					this.startProgress();
			break;
			case 'volumeChange':

				if( e.data.volume != this.volume ) {
					
					if( this.volume == 0 ) {
						
						if(!this.flag_vol_nonce && this.flag_playing) {
							this.track_unmute();
							this.callback_volumechange();

							if(!this.params.continuecfs) {
								this.seek(0);
								this.params.continuecfs = true;
							}
						}

						this.flag_vol_nonce = false;				
					} else 
					if( e.data.volume == 0 ) {
						if(this.playhead > 0 && !this.flag_vol_nonce && !this.flag_vol_mute) {
							this.track_mute();
							this.callback_volumechange();
						} else {
							this.flag_vol_mute = false;
						}
					} 

					this.volume = e.data.volume;

				} else
				if( this.flag_vol_nonce ) {

					if(this.params.startmuted) {
						this.volume = 1;
						this.setVolume(1);
						this.flag_vol_mute = true;
						this.flag_vol_nonce = false;
					} 
					else {
						this.volume = 0;
						this.setVolume(1);
						this.flag_vol_mute = false;
					}
				}

			break;

			case 'returnCurrentTime': {
				this.playhead = e.data.currentTime;

				let phpercentage = ( this.playhead / this.params.duration ) * 100;

				if( this.track.started !== true && phpercentage > 0 ) {
					this.track.started = true;

					if(this.flag_finished)
						this.track_replay();
					else
		            	this.track_start();

		            this.callback_play();
		            this.callback_start();

		            if(this.params.chromeless && this.params.overlay) {
						if(this.params.startmuted)
							this.dom_sound.style.display = 'block';
						else 
							this.dom_play.style.display = 'block';

						this.reflow(true);
					}
				}

				if(this.track.q25 !== true && phpercentage >= 25) {
		            this.track.q25 = true;
		            this.track_q25();
		        }

		        if(this.track.q50 !== true && phpercentage >= 50) {
		            this.track.q50 = true;
		            this.track_q50();
		        }

		        if(this.track.q75 !== true && phpercentage >= 75) {
		            this.track.q75 = true;
		            this.track_q75();
		        }

				// trace(this.playhead);

				this.callback_progress();
			}
			break;

			case 'scormEvent':

			break;
			case 'renditionChanged':

			break;
			case 'widgetClosed':
				if(this.flag_widget) {
					this.track_tagClose();
					this.flag_widget = false;
				}
			break;
			case 'widgetShown':
				this.flag_widget = true;
				this.trace(e);
				this.track_tagOpen();
			break;
			case 'clientCustomEvent':

			break;
			case 'tagClick':
				// this.track_tagClick();
			break;
			
			case 'addToCart':
				this.callback_cart(e.data)
			break;

			default:

				if(e.type === 'click') {

					if(this.dom_sound.style.display === 'block') {
						this.unmute();
					} else {
						this.play();
					}	
					this.dom_overlay.style.display = 'none';				
				} else {
					this.trace('nada');
				}


		}
	},

	startProgress() {
		this.stopProgress();

		this.prog_int = setInterval(()=>{
			this.updateHander();	
		}, this.update_int);
	},

	stopProgress() {
		if(this.api && this.flag_ready) clearInterval(this.prog_int);
	},

	updateHander() {
		if(this.api && this.flag_ready) window.wirewax.triggerEvent(window.wirewax.events.triggers.GET_CURRENT_TIME);

		if(this.flag_stopping)
			this.stopBatch();
	},

	track: {
        started: false,
        q25: false,
        q50: false,
        q75: false
    },

    resetTracking() {
        this.playhead = 0;
        this.track.started = false;
        this.track.q25 = false;
        this.track.q50 = false;
        this.track.q75 = false;
        this.flag_playing = false;
        this.flag_paused = false;
    },

    track_start()           { this.trace('------------------ track_start'); },
    track_stop()            { this.trace('------------------ track_stop'); },
    track_end()             { this.trace('------------------ track_end'); },
    track_play()            { this.trace('------------------ track_play'); },
    track_replay()          { this.trace('------------------ track_replay'); },
    track_pause()           { this.trace('------------------ track_pause'); },
    track_mute()            { this.trace('------------------ track_mute'); },
    track_unmute()          { this.trace('------------------ track_unmute'); },
    track_q25()             { this.trace('------------------ track_q25'); },
    track_q50()             { this.trace('------------------ track_q50'); },
    track_q75()             { this.trace('------------------ track_q75'); },
    track_tagOpen()			{ this.trace('------------------ track_tagOpen'); },
    track_tagClose()		{ this.trace('------------------ track_tagClose'); },
    track_tagSeek()			{ this.trace('------------------ track_tagSeek'); },
    // track_tagClick()		{ this.trace('------------------ track_tagClick'); },

    callback_progress()     { /* this.trace('------------------ callback_progress'); */ },
    callback_ready()        { this.trace('------------------ callback_ready'); },
    callback_end()          { this.trace('------------------ callback_end'); },
    callback_play()         { this.trace('------------------ callback_play'); },
    callback_start()         { this.trace('------------------ callback_start'); },
    callback_error()        { this.trace('------------------ callback_error'); },
    callback_stop()         { this.trace('------------------ callback_stop'); },
    callback_pause()        { this.trace('------------------ callback_pause'); },
    callback_show()         { this.trace('------------------ callback_show'); },
    callback_volumechange()       { this.trace('------------------ callback_volumechange'); },
    callback_cart(data)     { this.trace('------------------ callback_cart'); 
    	this.trace(data, 'cart data');
	},

	play() {
		if(this.api && this.flag_ready 
			&& !this.flag_widget) {
			if( ( this.flag_playing && this.flag_paused ) || 
				( !this.flag_playing && !this.flag_paused ) )
			window.wirewax.triggerEvent(window.wirewax.events.triggers.PLAY);
		} else 
		if (this.flag_widget) {
			this.tagClose();
		}
	},

	pause() {
		if( this.api && this.flag_ready &&
			this.flag_playing && !this.flag_paused && !this.flag_widget)
			if(this.api && this.flag_ready) window.wirewax.triggerEvent(window.wirewax.events.triggers.PAUSE);
	},

	stop() {
		if( this.api && this.flag_ready && 
			this.flag_playing ) {
			if( this.flag_widget ) {
				this.flag_stopping = true;
				this.tagClose();
			} else {
				this.stopBatch();
			}
		}
	},

	stopBatch() {
		this.flag_stopping = true;

		this.stopProgress();
		this.pause();
		this.seek(0);
		this.resetTracking();
		this.track_stop();
		this.callback_stop();

		this.flag_stopping = false;
	},

	seek(num) {
		if(this.api && this.flag_ready && 
			!this.flag_widget) {
			this.stopProgress();
			window.wirewax.triggerEvent(window.wirewax.events.triggers.SEEK, num);
		}
	},

	getTime() {
		return this.playhead;
	},

	isPlayerReady() {
		if(this.api && this.flag_ready) window.wirewax.triggerEvent(window.wirewax.events.triggers.IS_PLAYER_READY);
	},

	tagSeek(num) {
		if(this.api && this.flag_ready && 
			!this.flag_widget) {
			window.wirewax.triggerEvent(window.wirewax.events.triggers.GO_TO_TAG, num);
			this.track_tagSeek();
		}
	},

	tagOpen(num) {
		if(this.api && this.flag_ready && 
			!this.flag_widget) {
			window.wirewax.triggerEvent(window.wirewax.events.triggers.OPEN_TAG, num);
		}
	},

	tagClose() {
		if(this.api && this.flag_ready && 
			this.flag_widget) 
			window.wirewax.triggerEvent(window.wirewax.events.triggers.CLOSE_WIDGET);
	},

	mute() {
		if(this.api && this.flag_ready && 
			!this.flag_widget) 
			window.wirewax.triggerEvent(window.wirewax.events.triggers.MUTE_VOLUME);
	},

	unmute() {
		if(this.api && this.flag_ready && 
			!this.flag_widget) 
			window.wirewax.triggerEvent(window.wirewax.events.triggers.UNMUTE_VOLUME);
	},

	setVolume(num) {
		if(this.api && this.flag_ready && 
			!this.flag_widget) 
			window.wirewax.triggerEvent(window.wirewax.events.triggers.CHANGE_VOLUME, num);
	},

	// custom() {
	// 	if(this.api && this.flag_ready) window.wirewax.triggerEvent(window.wirewax.events.triggers., data);
	// },

	resetVariables() {

	},

	resetPlayback() {

	},

	unload() {
		this.stop();
		this.stopProgress();

		if(this.dom_overlay) {

			let _handler = (e) => {
        		this.eventHandler(e);
        	};

			this.dom_overlay.removeEventListener('click', _handler, false );
			this.dom_play.removeEventListener('click', _handler, false );
			this.dom_sound.removeEventListener('click', _handler, false );
			this.dom_replay.removeEventListener('click', _handler, false );
			
		}

		if(this.dom_container)
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

	destroy() {
		this.unload();
	},

	trace(str, str2) {
		if(this.debug) {

			if(window.console) {
				window.console.log(str, str2 ? str2 : '');
			}

			if( this.dom_debug ) {
				this.dom_debug.innerHTML += ( str2 ? ( str2 + ': ' ) : '' ) + str + '<br>';
			}
		}
	},

	setListeners() {
		for ( let key in window.wirewax.events.listeners ) {
			window.wirewax.addEventListener( window.wirewax.events.listeners[key], (e) => {
				this.eventHandler(e);
			}, false );
		}
	},

	listEvents() {
		for ( let key in window.wirewax.events.listeners )
			console.log(window.wirewax.events.listeners[key]);
	},

	setVendor(element, property, value) {
        let styles = window.getComputedStyle(element, '');
        let regexp = new RegExp(property+'$', "i");

        for (let key in styles) {
            if( regexp.test(key) ) {
                element.style[key] = value;
            }
        }
    },

    addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    },

    removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    },

    reflow(passive) {
        if(this.api && this.dom_overlay) {
            if(this.proxy) {
                this.proxy.width = this.dom_container.offsetWidth;
                this.proxy.height = this.dom_container.offsetHeight;
            }

            // CENTER ALL ELEMENTS FOUND IN center_controls ARRAY
            for(let key in this.centered_controls) {
                let item = this.centered_controls[key];

                    item.style.top = '50%';
                    item.style.marginTop = ( ( item.offsetHeight / 2 ) * -1 ) + 'px';
                    item.style.left = '50%';
                    item.style.marginLeft = ( ( item.offsetWidth / 2 ) * -1 ) + 'px';
            }

            if(!passive) {
                this.trace('reflow video');
            }
        }
        else if(!passive) {
            this.trace("reflow useless: video elements aren't ready");
        }
    },
};

if( !window['wirewax'] ) {
	let checkDebug = ( window['console'] && window['debug'] ) ? true : false;

	// NO API YET, LOAD MANUALLY
	if(checkDebug) console.log('LOADING WireWax API');

	let loadFunction = () => {
        if(checkDebug) console.log('WireWax API loaded');
    }

    let s = document.createElement("script");
    	s.type = "text/javascript";
    	s.src = 'https://edge-player.wirewax.com/ww4release/javascripts/wirewax-iframe-api.js';
		s.addEventListener("load", loadFunction, false);

    let head = document.getElementsByTagName("head")[0];
        head.appendChild(s);
}

/* 

CAVEATS FOR README:

- autoplay overrides startmuted
- unload() / destroy() are the same

*/