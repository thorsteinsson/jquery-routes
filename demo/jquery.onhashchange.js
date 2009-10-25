if (!('onhashchange' in window)) {
 	document.write('<script type="text/javascript" src="jquery.address-1.0.js"></script>');
	var timer = setInterval(function() {
		if ($.address) { clearInterval(timer); } else { return; }
		$.address.change(function() {
			if (location.hash.length > 0 && typeof (window.onhashchange) === 'function') {
				window.onhashchange.call(window);
			}
		});
	}, 100);
}