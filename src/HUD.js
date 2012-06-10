define([],function(){

	return {

		$active: null,
		$saved: null,
		somesaved: false,

		makeDom: function(){
			this.$active = $('<span class="hud-active"/>');
			this.$saved = $('<span class="hud-saved"/>');
			this.$wellcount = $('<span class="hud-wellcount"/>');

			$('body').append(this.$active).append(this.$saved).append(this.$wellcount);
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

		updateWellcount: function(w){
			this.$wellcount.text('Wells used: '+w);
		}

	};

});