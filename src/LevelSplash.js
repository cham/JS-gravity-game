define([],function(){

	var retryMessages = [
			'Too many particles died :(',
			'Fail',
			'Red wizard<br/>shot the food',
			'I hope for your sake<br/>you nuked that level',
			'Sorry Mario<br/><br/>The princess is in another castle',
			'Are you getting tired of seeing these yet?',
			'Oh no!',
			'You were not a bad enough dude to save<br/>the president',
			'You lose(r)',
			'Game over man,<br/>Game over!',
			'Prismatic core failing',
			'Xaero wins',
			'All your base are<br/>belong to us',
			'You Lost<br/><br/>YOU ARE WORTHLESS<br/>AND WEAK',
			'There is no cow level',
			'CONGRATULATIONS<br/><br/>You are the best loser',
			'Say "SKIP" into microphone<br/>to skip level'
		],
		firstFail = true;

	function isTouchDevice() {
	   var el = document.createElement('div');
	   el.setAttribute('ongesturestart', 'return;');
	   return typeof el.ongesturestart == "function";
	}

	function getRetryMessage(){
		var msg =  firstFail ? 'You did not save<br/>enough particles' : retryMessages[Math.random()*retryMessages.length | 0];
		firstFail = false;
		return msg + '<span class="tryagain">Touch to try again</span<';
	}

	return {
		show: function(text,cb){
			var $intro = $('<div class="intro">' + text + '</div>'),
				istouch = isTouchDevice();

			$('.intro').remove();
			$('body').append($intro);

			$intro.bind(istouch ? 'touchstart' : 'mousedown', function(e){
				e.preventDefault();
				e.stopPropagation();
				$intro.remove();
				cb();
				return false;
			});
		},

		retry: function(cb){
			var $intro = $('<div class="intro">' + getRetryMessage() + '</div>'),
				istouch = isTouchDevice();

			$intro.bind(istouch ? 'touchstart' : 'mousedown', function(e){
				e.preventDefault();
				e.stopPropagation();
				$intro.remove();
				cb();
				return false;
			});

			$('.intro').remove();
			$('body').append($intro);
		},

		complete: function(cb){

		}
	};

});