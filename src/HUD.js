define([],function(){

	return {

		$active: null,
		$saved: null,
		somesaved: false,

		makeDom: function(){
			this.$active = $('<span class="hud-active"/>'),
			this.$saved = $('<span class="hud-saved"/>');

			$('body').append(this.$active).append(this.$saved);
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
		}

	};

});