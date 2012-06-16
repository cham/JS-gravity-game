define([],function(){

	return {

		$active: null,
		$saved: null,
		somesaved: false,

		makeDom: function(){
			this.$active = $('<span class="hud-active"/>');
			this.$saved = $('<span class="hud-saved"/>');
			this.$killed = $('<span class="hud-killed"/>');
			this.$wellcount = $('<span class="hud-wellcount"/>');
			this.$log = $('<span class="hud-log"/>');
			this.$numtosave = $('<span class="hud-target"/>');

			$('body').append(this.$active,this.$saved,this.$killed,this.$wellcount,this.$log,this.$numtosave);
		},

		updateActive: function(a){
			this.$active.text('Active: '+a);
		},

		updateSaved: function(s){
			this.$saved.text('Saved: '+s);
			if(!this.somesaved && s>0){
				this.somesaved = true;
				this.$saved.addClass('somesaved');
			}
		},

		updateKilled: function(k){
			this.$killed.text('Lost: '+k);
		},

		updateWellcount: function(w){
			this.$wellcount.text('Wells: '+w);
		},

		updateNumToSave: function(n){
			this.$numtosave.text('Target: '+n);
		},

		log: function(s){
			this.$log.text(s);
		}

	};

});