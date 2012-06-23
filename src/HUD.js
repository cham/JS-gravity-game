define([],function(){

	return {

		somesaved: false,

		makeDom: function(){
			this.$active = $('<span class="hud-active"/>');
			this.$saved = $('<span class="hud-saved"/>');
			this.$killed = $('<span class="hud-killed"/>');
			this.$wellcount = $('<span class="hud-wellcount"/>');
			this.$log = $('<span class="hud-log"/>');
			this.$numtosave = $('<span class="hud-target"/>');
			this.$timeleft = $('<span class="hud-timeleft"/>');

			$('body').append(this.$active,this.$saved,this.$killed,this.$wellcount,this.$log,this.$numtosave,this.$timeleft);
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

		updateTimeLeft: function(ms){
			if(ms===-1){
				return;
			}

			var min = (ms / 60000) | 0,
				sec = ((ms - (min * 60000)) / 1000) | 0;

			min = (min===0) ? '00' : ((min<10) ? '0'+min : min );
			sec = (sec===0) ? '00' : ((sec<10) ? '0'+sec : sec );

			this.$timeleft.text(min+':'+sec);
		},

		log: function(s){
			this.$log.text(s);
		}

	};

});