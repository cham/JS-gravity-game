define(['lib/underscore-min','lib/requestAnimationFrame-polyfill'],

function(){

	return {

		lastTime: null,
		startTime: null,
		tickCb: function(){},
		timeUpCb: function(){},
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

		onTimeUp: function(cb){
			var lastTimeup = this.timeUpCb;
			this.timeUpCb = function(){
				lastTimeup();
				cb();
			};
		},

		getTimeLeft: function(){
			if(!this.maxTime){
				return -1;
			}
			return this.maxTime - ((new Date()).getTime() - this.startTime);
		},

		start: function(maxtime){
			var self = this,
				t = (new Date()).getTime();

			this.lastTime = t;
			this.startTime = t;
			this.haltFlag = false;
			this.maxTime = maxtime || null;

			(function animloop(){
				var t = (new Date()).getTime();
				if(_.isFunction(self.tickCb) && !self.haltFlag){
					self.tickCb(t - self.lastTime);
				}
				if(self.haltFlag){ return; }
				self.lastTime = t;

				if(self.maxTime && t-self.startTime > self.maxTime){
					self.timeUpCb();
				}

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