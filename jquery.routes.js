/**
 * jquery.routes.js
 * Routes in javascript using window.onhashchange event.
 * 
 * Copyright (c) 2009 Ægir Þorsteinsson
 * http://thorsteinsson.is
 *
 * Licensed under a Creative Commons Attribution 3.0 license
 * http://creativecommons.org/licenses/by/3.0/
 */
(function($) {
	$.routes = { 
		datatypes: {
			'd':	'\\d*?',
			'w':	'\\w*?',
			'date':	'\\d{1,2}\\.\\d{1,2}\\.\\d{4}'
		},
		list: [],
		routes: {},
		current: null,
		length: 0,
		reload: function(args) {
			if (this.current) {
				args = $.extend(this.current.arguments, args);
				this.current.func.execute(args);
			}
		},
		add: function(func, route, name, defaults) {
			if (name === undefined) { name = 'route' + (++this.length); }

			var regex = /\{\s*?([a-zA-Z0-9:\|\\*\?\.]*?)\s*?\}/gim;
			var items = ['var s="#' + route + '";'];
			var item = route;
			var routeexp = '^' + route;
			var vars = [];
			while (match = regex.exec(item)) {
				var arr = match[1].split(':');
				var first = arr[0];
				var extra = arr[1];
				items.push('s=s.replace("' + match[0] + '",p.' + first + ');');
				item = item.replace(match[0], '');
				if (extra) {
					if ($.routes.datatypes[extra]) {
						extra = $.routes.datatypes[extra];
					}
					routeexp = routeexp.replace(match[0], '(' + extra + ')');
				} else {
					routeexp = routeexp.replace(match[0], '(.*?)');
				}
				vars.push(match[1].split(':')[0]);
				regex.lastIndex = match.index;
			}
			items.push('return s;');

			
			this.list.push(this.routes[name] = {
				exp: new RegExp(routeexp, 'i'),
				route: route,
				func: func,
				url: new Function('p', items.join('')),
				routeTo: function(data) {
					window.location.href = this.url($.extend(defaults, data));
				},
				execute: function(data) {
					this.func.apply($.extend(defaults, data));
				},
				vars: vars,
				defaults: defaults
			});
		},
		get: function(name) {
			return this.routes[name];
		},
		changeHash: function(hash) {
			var route;
			var l = hash.substr(1);
			for (var i = 0; i < this.list.length; i++) {
				route = this.list[i];
				var exp = route.exp.exec(l);
				if (exp) {
					var context = route.defaults ? route.defaults : {};
					for (var i = 0; i < route.vars.length; i++) {
						context[route.vars[i]] = exp[i + 1];
					}
					$.routes.current = route;
					$.routes.current.arguments = context;
					route.func.apply(context);
					break;
				}
			}
		}
	};

	window.onhashchange = function() {
		$.routes.changeHash(location.hash);
	};
	$(function() {
		if (location.hash.length > 0) {
			window.onhashchange();
		}
	});
}(jQuery));