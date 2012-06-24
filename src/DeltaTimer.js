define(['lib/underscore-min','lib/requestAnimationFrame-polyfill'],

function(){

	return {

		lastTime: null,
		tickCb: function(){},
		everyStack: [],
		requestId: null,
		haltFlag: false,

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
			this.haltFlag = false;

			(function animloop(){
				var t = (new Date()).getTime();
				if(_.isFunction(self.tickCb) && !self.haltFlag){
					self.tickCb(t - self.lastTime);
				}
				if(self.haltFlag){ return; }
				self.lastTime = t;
				
		      	self.requestId = requestAnimationFrame(animloop);
		    })();
		},

		stop: function(){
			this.haltFlag = true;
			if(this.requestId){
				if(window.webkitCancelRequestAnimationFrame){
					webkitCancelRequestAnimationFrame(this.requestId); // update the fucking polyfill!
				}else{
					cancelAnimationFrame(this.requestId);
				}
			}
		}

	};

});