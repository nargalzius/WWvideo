var vid = new WireWaxPlayer();
	vid.debug = debug;
	vid.dom_debug = document.getElementById('debug');

	vid.callback_cart = function(data) {
		alert(data.product.name)
	};

	vid.callback_progress = function() {
		// vid.trace(vid.playhead);
	}

	vid.callback_end = function() {

	};

	vid.init();
	// vid.load();

	// vid.init({
	// 	// player: 'threeSixtyCanvasPlayer',
	// 	player: 'ff',
	// 	chromeless: true,
	// 	startmuted: false,
	// 	autoplay: false,
	// 	// src: '//embed.wirewax.com/8012777?embedLoc=footlocker/',
	// 	cover: true,
	// 	duration: 94.735955,
	// 	// width: 700,
	// 	// height: 500,
	// });

function debugReset() {
	document.getElementById('debug').innerHTML = '';
}

document.getElementById('debug').onclick = debugReset;

document.getElementById('video1').onclick = () => {
	vid.load({
		src: '//embed.wirewax.com/8022625/7bafa8/',
		duration: 111.07639
	});
	debugReset();
}

document.getElementById('video1ap').onclick = () => {
	vid.load({
		src: '//embed.wirewax.com/8022625/7bafa8/',
		autoplay: true,
		duration: 111.07639,
	});
	debugReset();
}

document.getElementById('video2').onclick = () => {
	vid.load({
		src: '//embed.wirewax.com/8012777?embedLoc=footlocker/',
		duration: 94.738446
	});
	debugReset();
}

document.getElementById('video2ap').onclick = () => {
	vid.load({
		src: '//embed.wirewax.com/8012777?embedLoc=footlocker/',
		autoplay: true,
		duration: 94.738446
	});
	debugReset();
}