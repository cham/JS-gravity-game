define([],function(){

	function fuzzy(range, base){
		return (base||0) + (Math.random()-0.5)*range*2;
	}

	return {

		cW: 480,
		cH: 280,
		ctx: null,
		$canvas: null,

		particles: [],
		particleOffset: 0, // required for infinite emitter
		particleAttrs: 6,
		numParticles: 400, // total particles when not infinite or max particles when infinite
		particleSize: 1,

		emitting: false,
		emitForce: 3,
		emitCoords: [240,140],

		gravityWells: [],
		maxWells: 2,

		frict: 0.95,

		emit: function(){
			if(!this.emitting || this.particles.length/this.particleAttrs > this.numParticles){
				return; // comment out for infinite emitter
				this.particleOffset++;
			}

			var rad = fuzzy(Math.PI),
				radius = Math.random() * this.emitForce;

			this.particles = this.particles.concat([
				this.emitCoords[0],this.emitCoords[1],0,
				Math.cos(rad)*radius,Math.sin(rad)*radius,0
			]);
		},

		move: function(){
			var self = this,
				i;
			for(i=(this.particleOffset*this.particleAttrs);i<this.particles.length;i+=this.particleAttrs){
				this.particles[i]   += this.particles[i+3];
				this.particles[i+1] += this.particles[i+4];
				this.particles[i+2] += this.particles[i+5];
				_(this.gravityWells).each(function(well){
					var xd = self.particles[i]-well[0],
						yd = self.particles[i+1]-well[1],
						dist = Math.pow(xd*xd + yd*yd,1/8);

					self.particles[i+3] += (well[2] / dist) * ((xd>0) ? -1 : 1);
					self.particles[i+4] += (well[2] / dist) * ((yd>0) ? -1 : 1);
				});
				this.particles[i+3] *= this.frict;
				this.particles[i+4] *= this.frict;
				this.particles[i+5] *= this.frict;
				if(this.particles[i]>this.cW || this.particles[i]<0){
					this.particles[i+3] = -this.particles[i+3];
				}
				if(this.particles[i+1]>this.cH || this.particles[i+1]<0){
					this.particles[i+4] = -this.particles[i+4];
				}
			}
		},

		addWell: function(well){
			this.gravityWells.unshift(well);
			if(this.gravityWells.length>this.maxWells){
				this.gravityWells.pop();
			}
		},

		onTouchStart: function(e){
			this.emitting = true;
			this.addWell([e.changedTouches[0].pageX,e.changedTouches[0].pageY,1]);
		},

		setupCanvas: function(){
			var canvas, self = this;

			this.$canvas = $('<canvas/>').attr({
				width: this.cW,
				height: this.cH
			});
			canvas = this.$canvas.get(0);
			this.ctx = canvas.getContext('2d');
			$('body').append(this.$canvas);

			canvas.addEventListener( 'touchstart', function(e){
				self.onTouchStart(e);
			}, false );
		},

		draw: function(){
			var i, c = 0, a,
				numParticles = (this.particles.length/this.particleAttrs) - this.particleOffset,
				self = this;

			if(!this.$canvas){
				this.setupCanvas();
			}

			this.ctx.fillStyle = "rgb(0,0,0)"; 
			this.ctx.fillRect(0, 0, this.cW, this.cH);
			this.ctx.fillStyle = "rgb(200,230,255)";
			for(i=(this.particleOffset*this.particleAttrs);i<this.particles.length;i+=this.particleAttrs){
				this.ctx.fillRect(this.particles[i],this.particles[i+1],this.particleSize,this.particleSize);
			}

			this.ctx.strokeStyle = "rgba(100,0,0,0.5)";
			this.ctx.lineWidth = 3;
			_(this.gravityWells).each(function(well){
				self.ctx.beginPath();
				self.ctx.arc(well[0], well[1], well[2]*20, 0, Math.PI*2, true); 
				self.ctx.closePath();
				self.ctx.stroke();
			});
		}

	};

});