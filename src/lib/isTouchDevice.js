define([],function isTouchDevice(){
	var el = document.createElement('div');
	el.setAttribute('ongesturestart', 'return;');
	return typeof el.ongesturestart == "function";
});