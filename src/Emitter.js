define([],function(){

	function fuzzy(range, base){
		return (base||0) + (Math.random()-0.5)*range*2;
	}
	function isTouchDevice() {
	   var el = document.createElement('div');
	   el.setAttribute('ongesturestart', 'return;');
	   return typeof el.ongesturestart == "function";
	}
	function intersection(x1, y1, x2, y2, x3, y3, x4, y4) { // top left coords 1, bottom right coords 2
	    var d = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4),
	    	xi,yi;
	    if(d === 0){
	    	return null;	
	    }

	    xi = ((x3-x4)*(x1*y2-y1*x2)-(x1-x2)*(x3*y4-y3*x4))/d;
	    yi = ((y3-y4)*(x1*y2-y1*x2)-(y1-y2)*(x3*y4-y3*x4))/d;

		if (xi < Math.min(x1,x2) || xi > Math.max(x1,x2)) return null;
		if (xi < Math.min(x3,x4) || xi > Math.max(x3,x4)) return null;

	    return [xi,yi];
	}

	return {

		touchdevice: false,
		uilock: true,
		clearSwitch: 1,
		drawCount: 0,

		cW: 480,
		cH: 280,
		ctx: null,
		$canvas: null,

		onNoActiveCallback: null,

		particles: [],
		particleOffset: 0, // required for infinite emitter
		particleAttrs: 4,
		numParticles: 100, // total particles when not infinite or max particles when infinite
		particleSize: 1,

		activeParticles: 0,
		savedParticles: 0,
		killedParticles: 0,

		safeBorders: [true,true,true,true], //t,r,b,l
		walls: [], //x1,y1,x2,y2,isSafe

		emitting: false,
		emitForce: 3,
		emitCoords: [0,0],

		gravityWells: [], // x,y,r,g,b
		maxWells: 1,
		wellsPlaced: 0,
		reverseWellGravity: true,

		goals: [], //x,y
		goalsize: 12,
	
		globalGravity: [0,0],
		
		frict: 0.95,

		resetLevel: function(){
			this.particles = [];
			this.safeBorders = [true,true,true,true];
			this.walls = [];
			this.globalGravity = [0,0];
			this.goals = [];
			this.gravityWells = [];
			this.activeParticles = 0;
			this.savedParticles = 0;
			this.killedParticles = 0;
			this.wellsPlaced = 0;
			this.emitting = false;
		},

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
			if(!this.particles.length){ return; }
			for(var i=index;i<index+this.particleAttrs;i++){
				this.particles[i] = false;
			}
			this.activeParticles--;
			this.killedParticles++;
			if(this.activeParticles===0 && this.onNoActiveCallback){
				this.onNoActiveCallback(this.savedParticles);
			}
		},

		saveParticle: function(index){
			for(var i=index;i<index+this.particleAttrs;i++){
				this.particles[i] = false;
			}
			this.activeParticles--;
			this.savedParticles++;
			if(this.activeParticles===0 && this.onNoActiveCallback){
				this.onNoActiveCallback(this.savedParticles);
			}
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

					if(self.reverseWellGravity){
						self.particles[i+2] -= ((well[2] / dist) * ((xd>0) ? -1 : 1)); // ternary at the end creates square attraction box
						self.particles[i+3] -= ((well[2] / dist) * ((yd>0) ? -1 : 1));
					}else{
						self.particles[i+2] += ((well[2] / dist) * ((xd>0) ? -1 : 1)); // ternary at the end creates square attraction box
						self.particles[i+3] += ((well[2] / dist) * ((yd>0) ? -1 : 1));
					}
				});

				// affect accelleration by gravity
				this.particles[i+2] += this.globalGravity[0];
				this.particles[i+3] += this.globalGravity[1];

				// move by accelleration
				this.particles[i]   += this.particles[i+2];
				this.particles[i+1] += this.particles[i+3];

				// apply friction
				this.particles[i+2] *= this.frict;
				this.particles[i+3] *= this.frict;

				// bounce off play area walls or kill if not safe
				if(this.particles[i]>this.cW || this.particles[i]<0){
					this.particles[i+2] = -this.particles[i+2]; // reverse accel
					if(this.particles[i]<0){
						this.particles[i] = 1;
						if(!this.safeBorders[3]){
							this.killParticle(i);
						}
					}else{
						this.particles[i] = this.cW-1;
						if(!this.safeBorders[1]){
							this.killParticle(i);
						}
					}
				}
				if(this.particles[i+1]>this.cH || this.particles[i+1]<0){
					this.particles[i+3] = -this.particles[i+3]; // reverse accel
					if(this.particles[i+1]<0){
						this.particles[i+1] = 1;
						if(!this.safeBorders[0]){
							this.killParticle(i);
						}
					}else{
						this.particles[i+1] = this.cH-1;
						if(!this.safeBorders[2]){
							this.killParticle(i);
						}
					}
				}

				// bounce off game area walls or kill if not safe
				_(this.walls).each(function(wall){
					if(intersection(
						self.particles[i] + (self.particles[i+2] > 0 ? 1 : -1), self.particles[i+1] + (self.particles[i+3] > 0 ? 1 : -1),
						self.particles[i] - self.particles[i+2] - (self.particles[i+2] > 0 ? 1 : -1), self.particles[i+1]-self.particles[i+3] - (self.particles[i+3] > 0 ? 1 : -1),
						wall[0],wall[1],wall[2],wall[3]
					)){
						self.killParticle.call(self,i);
					}
				});

				_(this.goals).each(function(goal){
					var xd = self.particles[i]-goal[0],
						yd = self.particles[i+1]-goal[1];

					if((xd > 0 ? xd : -xd)<self.goalsize && (yd > 0 ? yd : -yd)<self.goalsize){
						self.saveParticle.call(self,i);
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
			this.wellsPlaced++;
		},

		addGoal: function(x,y){
			this.goals.push([x,y]);
		},

		addWall: function(wall){
			this.walls.push(wall);
		},

		onTouch: function(e){
			if(this.uilock){
				return;
			}

			var x = this.touchdevice ? e.changedTouches[0].pageX : e.pageX,
				y = this.touchdevice ? e.changedTouches[0].pageY : e.pageY,
				self = this;
/*
			if(_(this.goals).find(function(goal){
				return Math.abs(goal[0]-x) < self.goalsize && Math.abs(goal[1]-y) < self.goalsize;
			})){
				return;
			}
*/
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

		draw: function(dCount){
			var i, c = 0, a,
				numParticles = (this.particles.length/this.particleAttrs) - this.particleOffset,
				self = this;

			if(!this.$canvas){
				this.setupCanvas();
			}

			this.clearSwitch--;
			if(!this.clearSwitch){
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

			this.ctx.lineWidth = 2;
			_(this.gravityWells).each(function(well){
				self.ctx.strokeStyle = "rgba("+well[3]+","+well[4]+","+well[5]+",1)";
				self.ctx.beginPath();
				self.ctx.arc(well[0], well[1], well[2]*20, 0, Math.PI*2, true); 
				self.ctx.closePath();
				self.ctx.stroke();
			});

			this.drawGoals();

			// draw emitter
			this.drawEmitter();

			// draw walls
			this.ctx.strokeStyle = "rgba(255,100,100,1)";
			_(this.walls).each(function(wall){
				self.ctx.beginPath();
				self.ctx.moveTo(wall[0],wall[1]);
				self.ctx.lineTo(wall[2],wall[3]);
				self.ctx.closePath();
				self.ctx.stroke();
			});

			this.drawCount++;
		},

		drawGoals: function(){
			var self = this,
				alphaBase = ((this.drawCount % 50)/50) - ((this.drawCount % 25)/25),
				grd;

			_(this.goals).each(function(goal){
				grd = self.ctx.createRadialGradient(goal[0], goal[1], 0, goal[0], goal[1], self.goalsize);
				grd.addColorStop(0, "rgba(100,200,100,"+Math.abs(0.5-alphaBase)+")");
				grd.addColorStop(1, "rgba(100,200,100,0)");
				self.ctx.fillStyle = grd;

				self.ctx.strokeStyle = "rgba(100,200,100,"+alphaBase+")";
				self.ctx.lineWidth = 2;
				self.ctx.beginPath();
				self.ctx.arc(goal[0], goal[1], self.goalsize, 0, Math.PI*2, true); 
				self.ctx.closePath();
				self.ctx.fill();

				self.ctx.strokeStyle = "rgba(100,200,100,"+(1-alphaBase)+")";
				self.ctx.lineWidth = 1;
				self.ctx.beginPath();
				self.ctx.arc(goal[0], goal[1], self.goalsize-5, 0, Math.PI*2, true); 
				self.ctx.closePath();
				self.ctx.stroke();

				self.ctx.strokeStyle = "rgba(100,200,100,"+Math.abs(0.5-alphaBase)+")";
				self.ctx.beginPath();
				self.ctx.arc(goal[0], goal[1], self.goalsize-10, 0, Math.PI*2, true); 
				self.ctx.closePath();
				self.ctx.stroke();
			});
		},

		drawEmitter: function(){
			this.ctx.save();
			this.ctx.translate(this.emitCoords[0],this.emitCoords[1]);
        	this.ctx.rotate(360*(this.drawCount % 800));
			this.ctx.lineWidth = 2;
			this.ctx.strokeStyle = "rgba(255,100,100,1)";
			this.ctx.beginPath();
			this.ctx.lineTo(8,0);
			this.ctx.lineTo(0,8);
			this.ctx.lineTo(-8,0);
			this.ctx.lineTo(0,-8);
			this.ctx.closePath();
			this.ctx.stroke();
			this.ctx.restore();
			this.ctx.save();
			this.ctx.translate(this.emitCoords[0],this.emitCoords[1]);
        	this.ctx.rotate(-360*(this.drawCount % 800));
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = "rgba(100,255,100,1)";
			this.ctx.beginPath();
			this.ctx.lineTo(4,0);
			this.ctx.lineTo(0,4);
			this.ctx.lineTo(-4,0);
			this.ctx.lineTo(0,-4);
			this.ctx.closePath();
			this.ctx.stroke();
			this.ctx.restore();
		},

		setCoords: function(x,y){
			this.emitCoords = [x,y];
		},

		setGravity: function(ax,ay){
			this.globalGravity = [ax,ay];
		},

		setMaxWells: function(m){
			this.maxWells = m;
		},

		setSafeBorders: function(safeArr){
			this.safeBorders = safeArr;
		},

		respondToUI: function(state){
			if(state===false){
				this.uilock = true;
				return;
			}
			this.uilock = false;
		},

		onNoActiveParticles: function(cb){
			this.onNoActiveCallback = cb;
		},

		getNumActiveParticles: function(){
			return this.activeParticles;
		},

		getNumSavedParticles: function(){
			return this.savedParticles;
		},

		getNumKilledParticles: function(){
			return this.killedParticles;
		},

		getNumWellsPlaced: function(){
			return this.wellsPlaced;
		}

	};

});