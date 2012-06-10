require(['DeltaTimer','Emitter'],

function(DeltaTimer,Emitter){

  DeltaTimer.onTick(function(delta){
    Emitter.move();
    Emitter.draw();
    Emitter.emit();
  });
  DeltaTimer.start();

  document.body.scrollTop = 100;
});
