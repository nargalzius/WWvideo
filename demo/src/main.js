var vid = new WireWaxPlayer();
	vid.debug = debug;
	vid.dom_debug = document.getElementById('debug');

	vid.callback_cart = function(data) {
		alert(data.product.name)
	};

	vid.init();

function debugReset() {
	vid.dom_debug.innerHTML = '';
}

$('#debug').click(debugReset);

$('.btn').click(function(){

	switch($(this).attr('id')) {
		case 'video1':
			vid.load({
				src: '//embed.wirewax.com/8022625/7bafa8/',
				duration: 111.07639
			});
		break;

		case 'video1ap':
			vid.load({
				src: '//embed.wirewax.com/8022625/7bafa8/',
				autoplay: true,
				duration: 111.07639,
				chromeless: true,
				overlay: true
			});
		break;

		case 'video2':
			vid.load({
				src: '//embed.wirewax.com/8012777?embedLoc=footlocker/',
				duration: 94.738446
			});
		break;

		case 'video2ap':
			vid.load({
				src: '//embed.wirewax.com/8012777?embedLoc=footlocker/',
				autoplay: true,
				duration: 94.738446
			});
		break;
	}

	debugReset();

});