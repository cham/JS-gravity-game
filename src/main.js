require(['DeltaTimer','Emitter','HUD'],

function(DeltaTimer,Emitter,HUD){

	HUD.makeDom();

	Emitter.addGoal(440,240);

	DeltaTimer.onTick(function(delta){
		Emitter.move();
		Emitter.draw();
		Emitter.emit();
		HUD.updateActive(Emitter.getActiveParticles());
		HUD.updateSaved(Emitter.getSavedParticles());
	});
	DeltaTimer.start();

	document.body.scrollTop = 100;
});
