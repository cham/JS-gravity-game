define([],function(){

	var rootUrl = location.href.indexOf('localhost')>-1 ? 'levels/' : 'http://dl.dropbox.com/u/2741750/gravity/levels/';

	var Level = function Level(num,onloaded){
		this.levelnum = num;
		this.onloaded = onloaded;
		this.fetch();
	};

	Level.prototype.fetch = function fetch(){
		var self = this;
		$.ajax({
			url: rootUrl + this.levelnum + '.json',
			dataType: 'json',
			data: {},
			error: function(e){ console.log(e); },
			success: function(data){
				self.fetched(data);
			}
		});
	};

	Level.prototype.fetched = function fetched(d){
		// pass data to onloaded
		if(this.onloaded){
			this.onloaded({
				emitterCoords: d.emitterCoords,
				goalCoords: d.goalCoords,
				globalGravity: d.globalGravity,
				safeEdges: d.safeEdges,
				walls: d.walls,
				amountToSave: d.amountToSave,
				introText: d.introText,
				numberOfWells: d.numberOfWells || 1,
				repulsors: !!d.repulsors,
				totalWells: d.totalWells || -1,
				movingWalls: d.movingWalls || [],
				timer: d.timer || null
			});
		}
	};



	return Level;

});