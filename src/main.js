require(['DeltaTimer','Emitter','HUD','Loader'],

function(DeltaTimer,Emitter,HUD,Loader){

	var lazyEvery = 6,
		lazyCount = lazyEvery;

	Emitter.respondToUI(false);

	HUD.makeDom();/*
	HUD.bindScroll(function(){
		document.body.scrollTop = 100;
	});*/

	DeltaTimer.onTick(function(delta){
		Emitter.move();
		Emitter.draw(lazyCount);
		Emitter.emit();

		lazyCount--;
		if(!lazyCount){
			HUD.updateActive(Emitter.getNumActiveParticles());
			HUD.updateSaved(Emitter.getNumSavedParticles());
			HUD.updateKilled(Emitter.getNumKilledParticles());
			HUD.updateTimeLeft(Emitter.getTimeLeft());
			lazyCount = lazyEvery;
		}
	});

	Emitter.onNoActiveParticles(function(savedCount){
		Loader.levelComplete(savedCount);
	});

	Loader.onCompleteLevel(function(){
		Emitter.respondToUI(false);
		DeltaTimer.stop();
		Emitter.resetLevel();
	});

	Loader.onFailLevel(function(){
		DeltaTimer.stop();
		Emitter.resetLevel();
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
		_(levelData.movingWalls).each(function(mWall){
			Emitter.addMovingWall(mWall);
		});

		Emitter.setMaxWells(levelData.numberOfWells);
		Emitter.setTotalWells(levelData.totalWells);
		Emitter.setSafeBorders(levelData.safeEdges);

		Emitter.particlesToSave = levelData.amountToSave;
		Emitter.reverseWellGravity = levelData.repulsors;

		Emitter.setTimeLimit(levelData.timer);

		Emitter.setBackground(levelData.background);

		DeltaTimer.start();
	});

	Loader.startGame();

	document.body.scrollTop = 100;
});
