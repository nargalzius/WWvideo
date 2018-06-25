var vid = new WireWaxPlayer();
	vid.debug = debug;
	vid.dom_debug = document.getElementById('debug');
	vid.callback_cart = function(data) {
		alert(data.product.name)
	};

	vid.callback_progress = function() {
		// trace(vid.playhead);
	}

	vid.callback_end = function() {
		vid.load('//embed.wirewax.com/8012777?embedLoc=footlocker/');
	};
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
	vid.init(true);


q$('#stop').onclick = () => {
	vid.stop();
}

q$('#time').onclick = () => {
	alert( vid.getTime() );
}

q$('#destroy').onclick = () => {
	vid.destroy();
}

q$('#init').onclick = () => {
	vid.load('//embed.wirewax.com/8012777?embedLoc=footlocker/');
}