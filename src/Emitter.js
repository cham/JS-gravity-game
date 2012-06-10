define([],function(){

	function fuzzy(range, base){
		return (base||0) + (Math.random()-0.5)*range*2;
	}
	function isTouchDevice() {
	   var el = document.createElement('div');
	   el.setAttribute('ongesturestart', 'return;');
	   return typeof el.ongesturestart == "function";
	}

	return {

		touchdevice: false,
		clearSwitch: 1,

		cW: 480,
		cH: 270,
		ctx: null,
		$canvas: null,

		particles: [],
		particleOffset: 0, // required for infinite emitter
		particleAttrs: 4,
		numParticles: 100, // total particles when not infinite or max particles when infinite
		particleSize: 1,
		activeParticles: 0,
		savedParticles: 0,

		emitting: false,
		emitForce: 3,
		emitCoords: [240,140],

		globalGravity: [0,0],
		gravityWells: [], // x,y,r,g,b
		maxWells: 2,

		goals: [], //x,y
		goalsize: 10,

		frict: 0.95,

		emit: function(){
			if(!this.emitting || this.particles.length/this.particleAttrs >= this.numParticles){
				return; // comment out for infinite emitter
				this.particleOffset++;
			}

			var rad = fuzzy(Math.PI);

			this.particles = this.particles.concat([
				this.emitCoords[0], this.emitCoords[1],
				Math.cos(rad)*this.emitForce, Math.sin(rad)*this.emitForce
			]);
			this.activeParticles++;
		},

		killParticle: function(index){
			for(var i=index;i<index+this.particleAttrs;i++){
				this.particles[i] = false;
			}
			this.activeParticles--;
			this.savedParticles++;
		},

		move: function(){
			var self = this,
				i;
			for(i=(this.particleOffset*this.particleAttrs);i<this.particles.length;i+=this.particleAttrs){

				if(this.particles[i]===false){
					continue;
				}
				// affect accelleration by wells
				_(this.gravityWells).each(function(well){
					var xd = self.particles[i]-well[0],
						yd = self.particles[i+1]-well[1],
						dist = Math.pow(xd*xd + yd*yd,1/8);

					self.particles[i+2] += ((well[2] / dist) * ((xd>0) ? -1 : 1)); // ternary at the end creates square attraction box
					self.particles[i+3] += ((well[2] / dist) * ((yd>0) ? -1 : 1));
				});

				// affect accelleration by gravity
				self.particles[i+2] += this.globalGravity[0];
				self.particles[i+3] += this.globalGravity[1];

				// move by accelleration
				this.particles[i]   += this.particles[i+2];
				this.particles[i+1] += this.particles[i+3];

				// bounce off play area walls
				if(this.particles[i]>this.cW || this.particles[i]<0){
					this.particles[i+2] = -this.particles[i+2]; // reverse accel
					if(this.particles[i]<0){
						this.particles[i] = 1;
					}else{
						this.particles[i] = this.cW-1;
					}
				}
				if(this.particles[i+1]>this.cH || this.particles[i+1]<0){
					this.particles[i+3] = -this.particles[i+3]; // reverse accel
					if(this.particles[i+1]<0){
						this.particles[i+1] = 1;
					}else{
						this.particles[i+1] = this.cH-1;
					}
				}

				// apply friction
				this.particles[i+2] *= this.frict;
				this.particles[i+3] *= this.frict;

				_(this.goals).each(function(goal){
					var xd = self.particles[i]-goal[0],
						yd = self.particles[i+1]-goal[1];

					if((xd > 0 ? xd : -xd)<self.goalsize && (yd > 0 ? yd : -yd)<self.goalsize){
						self.killParticle.call(self,i);
					}
				});
			}
		},

		makeWellColour: function(){
			return 	[ 
					 (100 + (Math.random() * 155)) | 0,
					 (100 + (Math.random() * 155)) | 0,
					 (100 + (Math.random() * 155)) | 0
					];
		},

		addWell: function(well){
			this.gravityWells.unshift(well);
			if(this.gravityWells.length>this.maxWells){
				this.gravityWells.pop();
			}
		},

		addGoal: function(x,y){
			this.goals.push([x,y]);
		},

		onTouch: function(e){
			var x = this.touchdevice ? e.changedTouches[0].pageX : e.pageX,
				y = this.touchdevice ? e.changedTouches[0].pageY : e.pageY,
				self = this;

			if(_(this.goals).find(function(goal){
				return Math.abs(goal[0]-x) < self.goalsize*2 && Math.abs(goal[1]-y) < self.goalsize*2;
			})){
				return;
			}
			this.emitting = true;
			this.addWell([x,y,0.5].concat(this.makeWellColour()));
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

			if(this.touchdevice){
				canvas.addEventListener( 'touchstart', function(e){
					self.onTouch(e);
				}, false );
			}else{
				canvas.addEventListener( 'mousedown', function(e){
					self.onTouch(e);
				}, false );
			}
		},

		draw: function(){
			var i, c = 0, a,
				numParticles = (this.particles.length/this.particleAttrs) - this.particleOffset,
				self = this;

			if(!this.$canvas){
				this.setupCanvas();
			}

			this.clearSwitch--;
			if(!this.clearSwitch){/*
				this.ctx.fillStyle = "rgb(0,0,0)"; 
				this.ctx.fillRect(0, 0, this.cW, this.cH);*/
				this.clearSwitch = 1;
				this.ctx.clearRect(0, 0, this.cW, this.cH);
			}

			this.ctx.fillStyle = "rgb(255,255,255)";
			for(i=(this.particleOffset*this.particleAttrs);i<this.particles.length;i+=this.particleAttrs){
				if(this.particles[i]===false){
					continue;
				}
				this.ctx.fillRect(this.particles[i],this.particles[i+1],this.particleSize,this.particleSize);
			}

			this.ctx.lineWidth = 3;
			_(this.gravityWells).each(function(well){
				self.ctx.strokeStyle = "rgba("+well[3]+","+well[4]+","+well[5]+",1)";
				self.ctx.beginPath();
				self.ctx.arc(well[0], well[1], well[2]*20, 0, Math.PI*2, true); 
				self.ctx.closePath();
				self.ctx.stroke();
			});

			self.ctx.strokeStyle = "rgba(100,200,100,1)";
			_(this.goals).each(function(goal){
				self.ctx.beginPath();
				self.ctx.arc(goal[0], goal[1], self.goalsize, 0, Math.PI*2, true); 
				self.ctx.closePath();
				self.ctx.stroke();

				self.ctx.lineWidth = 2;
				self.ctx.beginPath();
				self.ctx.arc(goal[0], goal[1], self.goalsize-5, 0, Math.PI*2, true); 
				self.ctx.closePath();
				self.ctx.stroke();
			});
		},

		getActiveParticles: function(){
			return this.activeParticles;
		},

		getSavedParticles: function(){
			return this.savedParticles;
		}

	};

});