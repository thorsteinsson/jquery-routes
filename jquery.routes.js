/**
 * jquery.routes.js
 * Routing in javascript using window.onhashchange event.
 * 
 * Copyright (c) 2009 Ægir Þorsteinsson
 * http://thorsteinsson.is
 *
 * Licensed under a Creative Commons Attribution 3.0 license
 * http://creativecommons.org/licenses/by/3.0/
 */
(function($) {
	var routecount = 0;
	$.extend({
		routes: {
			// datatype detectors for parameters
			datatypes: {
				'int':		/\d*?/,
				'float':	/\d+\.\d+/,
				'word':		/\w*?/,
				'date':		/(\d{1,2})\.(\d{1,2})\.(\d{4})/
			},
			// convert parameter to correct datatype, the regex groups are passed as arguments
			parsers: {
				'int':	function(d) { return parseInt(d); },
				'float':	function(d) { return parseFloat(d); },
				'date':	function(d, dd, mm, yyyy) { return new Date(yyyy, mm, dd); }
			},
			// object containing all the routes by name
			list: {},
			// current executed route with parameter info
			current: null,
			// reload the current route with same or different parameters
			reload: function(args) {
				if (this.current) {
					args = $.extend(this.current.arguments, args);
					this.current.func.execute(args);
				}
			},
			// add a route, they can be named and with default parameters
			add: function(func, route, name, defaults) {
				if (name === undefined) { name = 'route' + (++routecount); }
	
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
							extra = extra.toString().replace(/\(/g, '').replace(/\)/g, ''); // remove groups
							extra = extra.substring(1, extra.length - 1);
						}
						routeexp = routeexp.replace(match[0], '(' + extra + ')');
					} else {
						routeexp = routeexp.replace(match[0], '(.*?)');
					}
					vars.push(match[1].split(':'));
					regex.lastIndex = match.index;
				}
				items.push('return s;');
	
				this.list[name] = {
					name: name,
					exp: new RegExp(routeexp, 'i'),
					route: route,
					func: func,
					url: new Function('p', items.join('')),
					routeTo: function(data) {
						window.location.href = this.url($.extend(defaults, data));
					},
					execute: function(data) {
						data = $.extend(defaults, data);
						$.routes.current = this;
						$.routes.current.arguments = data;
						this.func.apply(data);
					},
					vars: vars,
					defaults: defaults
				};
			},
			// get a registered route with name			
			get: function(name) {
				return this.list[name];
			},
			// load a hash and find the correct route to execute
			load: function(hash) {
				hash = hash.substr(1);
				var route;
				var args;
				// search for routes
				$.each(this.list, function(i, match) {
					// check for a match
					var exp = match.exp.exec(hash);
					if (exp) {
						if ((route && match.route.length > route.route.length) || !route) {
							route = match;
							args = exp;
						}
					}
				});
				
				// load the defaults
				var context = route.defaults ? route.defaults : {};
				// get parameters
				$.each(route.vars, function(x, vars) {
					var parser = $.routes.parsers[vars[1]];
					var val = args[x+1];
					// parse parameter
					if (parser) {
						var datatype = $.routes.datatypes[vars[1]];
						val = [val];
						// get arguments for parser
						if (datatype) {
							var p = datatype.exec(args[x+1]);
							for (var y = 1; y < p.length; y++) {
								val.push(p[y]);
							}
						}
						val = parser.apply(this, val);
					}
					context[vars[0]] = val;
				});
				
				// execute route
				route.execute(context);
			}
		}
	});

	// Listen for hash change event
	window.onhashchange = function() {
		$.routes.load(location.hash);
	};
	
	// Run route on document ready
	$(function() {
		if (location.hash.length > 0) {
			window.onhashchange();
		}
	});
}(jQuery));
