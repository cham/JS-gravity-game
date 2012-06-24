define(['Level', 'LevelSplash'],
function(Level, LevelSplash){

	return {

		levelnum: 1,
		startlevel: 1,
		level: null,
		onComplete: null,
		onStart: null,
		onFail: null,
		amountToSave: 0,

		onCompleteLevel: function(cb){
			this.onComplete = cb;
		},

		onFailLevel: function(cb){
			this.onFail = cb;
		},

		levelComplete: function(saved){
			if(saved > this.amountToSave){
				this.levelCompleted();
			}else{
				this.levelFailed();
			}
		},

		levelCompleted: function(){
			var self = this;
			if(this.onComplete){
				this.onComplete();
			}
			LevelSplash.complete(this.levelnum,function(){
				self.nextLevel();
			});
		},

		levelFailed: function(){
			var self = this;
			if(this.onFail){
				this.onFail();
			}
			LevelSplash.retry(function(){
				self.loadLevel();
			});
		},

		onStartLevel: function(cb){
			this.onStart = cb;
		},

		nextLevel: function(){
			this.levelnum++;
			this.loadLevel();
		},

		loadLevel: function(){
			var self = this;
			LevelSplash.showLoading();
			this.level = new Level(this.levelnum,function(levelDescription){
				// parse levelDescription
				self.amountToSave = levelDescription.amountToSave-1 || 100;
				self.scorebands = levelDescription.scorebands;
				LevelSplash.show(levelDescription.introText,function(){
					// run onstart method
					if(self.onStart){
						self.onStart(levelDescription);
					}
				});
			});
		},

		setLevel: function(l){
			this.levelnum = l;
		},

		startGame: function(){
			this.setLevel(this.startlevel);
			this.loadLevel();
		},

		getAmountToSave: function(){
			return this.amountToSave+1;
		}

	};

});