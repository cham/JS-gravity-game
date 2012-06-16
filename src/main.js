require(['DeltaTimer','Emitter','HUD','Loader'],

function(DeltaTimer,Emitter,HUD,Loader){

	var lazyEvery = 6,
		lazyCount = lazyEvery;

	Emitter.respondToUI(false);

	DeltaTimer.onTick(function(delta){
		Emitter.move();
		Emitter.draw(lazyCount);
		Emitter.emit();
		lazyCount--;
		if(!lazyCount){
			HUD.updateActive(Emitter.getNumActiveParticles());
			HUD.updateSaved(Emitter.getNumSavedParticles());
			//HUD.updateWellcount(Emitter.getNumWellsPlaced());
			HUD.updateKilled(Emitter.getNumKilledParticles());
			lazyCount = lazyEvery;
		}
		//HUD.log(Emitter.uilock===true ? 'true':'false');
	});


	HUD.makeDom();
	//HUD.log(Emitter.uilock===true ? 'true':'false');

	Emitter.onNoActiveParticles(function(savedCount){
		Loader.levelComplete(savedCount);
	});

	Loader.onCompleteLevel(function(){
		Emitter.respondToUI(false);
		DeltaTimer.stop();
		Emitter.resetLevel();
		Loader.nextLevel();
	});

	Loader.onFailLevel(function(){
		DeltaTimer.stop();
		Emitter.resetLevel();
		Emitter.killedParticles = 0;
	});

	Loader.onStartLevel(function(levelData){

		HUD.updateNumToSave(Loader.getAmountToSave());
		Emitter.respondToUI();

		Emitter.setCoords(levelData.emitterCoords[0], levelData.emitterCoords[1]);
		Emitter.addGoal(levelData.goalCoords[0], levelData.goalCoords[1]);
		Emitter.setGravity(levelData.globalGravity[0], levelData.globalGravity[1]);

		_(levelData.walls).each(function(wall){
			Emitter.addWall(wall);
		});

		Emitter.setMaxWells(levelData.numberOfWells || 1);
		Emitter.setSafeBorders(levelData.safeEdges);

		Emitter.reverseWellGravity = levelData.repulsors;

		DeltaTimer.start();
	});

	Loader.startGame();

	window.Emitter = Emitter;

	

	document.body.scrollTop = 100;
});
