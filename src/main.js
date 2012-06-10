require(['DeltaTimer','Emitter','HUD'],

function(DeltaTimer,Emitter,HUD){

	HUD.makeDom();

	Emitter.addGoal(440,240);

	DeltaTimer.onTick(function(delta){
		Emitter.move();
		Emitter.draw();
		Emitter.emit();
		HUD.updateActive(Emitter.getNumActiveParticles());
		HUD.updateSaved(Emitter.getNumSavedParticles());
		HUD.updateWellcount(Emitter.getNumWellsPlaced());
	});
	DeltaTimer.start();

	document.body.scrollTop = 100;
});
