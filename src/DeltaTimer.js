define(['lib/underscore-min','lib/requestAnimationFrame-polyfill'],

function(){

	return {

		lastTime: null,
		tickCb: function(){},
		everyStack: [],

		onTick: function(cb){
			var lastCb = this.tickCb;
			this.tickCb = function(d){
				lastCb(d);
				cb(d);
			};
		},

		start: function(){
			var self = this,
				t = (new Date()).getTime();

			this.lastTime = t;

			(function animloop(){
				var t = (new Date()).getTime();
				if(_.isFunction(self.tickCb)){
					self.tickCb(t - self.lastTime);
				}
				self.lastTime = t;

		      	requestAnimationFrame(animloop);
		    })();
		}

	};

});