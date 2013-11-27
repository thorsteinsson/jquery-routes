/*
 * jQuery routes - v2.0
 * Routing in javascript using hashchange event.
 * http://thorsteinsson.is/projects/jquery-routes/
 *
 * Copyright (c) 2010 Ægir Þorsteinsson
 * Licensed under a Creative Commons Attribution 3.0 license
 * http://creativecommons.org/licenses/by/3.0/
 */
(function($) {
	var routecount = 0,
		datelpad = function(d) {
			d = d + '';
			return d.length < 2 ? '0' + d : d;
		},
		legacyDateTypes = {
			'date':		{
				regexp: /(\d{1,2})\-(\d{1,2})\-(\d{4})/,
				parse: function(d, dd, mm, yyyy) { 
					return new Date(yyyy, datelpad(mm - 1), datelpad(dd)); 
				},
				stringify: function(date) {
					return datelpad(date.getDate()) + '-' + datelpad(date.getMonth() + 1) + '-' + date.getFullYear();
				}
			},
			'dateend':  {
				regexp: /(\d{1,2})\-(\d{1,2})\-(\d{4})/,
				parse: function(d, dd, mm, yyyy) { 
					return new Date(yyyy, mm - 1, dd, 23, 59, 59, 999); 
				},
				stringify: function(date) { 
					return datelpad(date.getDate()) + '-' + datelpad(date.getMonth() + 1) + '-' + date.getFullYear();
				}
			}
		},
		isoDateTypes = {
			'date':		{
				regexp: /(\d{4})\-(\d{1,2})\-(\d{1,2})/,
				parse: function(d, yyyy, mm, dd) { 
					return new Date(yyyy, mm - 1, dd); 
				},
				stringify: function(date) {
					return date.toISOString().split('T')[0];
				}
			},
			'dateend':  {
				regexp: /(\d{4})\-(\d{1,2})\-(\d{1,2})/,
				parse: function(d, yyyy, mm, dd) { return new Date(yyyy, mm - 1, dd, 23, 59, 59, 999); },
				stringify: function(date) { 
					return date.toISOString().split('T')[0];
				}
			}
		};

	$.extend({		
		routes: {
			useIsoDates: function(iso){
				if(iso === true){
					this.datatypes.date = isoDateTypes.date;
					this.datatypes.dateend = isoDateTypes.dateend;
				}
				else {
					this.datatypes.date = legacyDateTypes.date;
					this.datatypes.dateend = legacyDateTypes.dateend;
				}
			},
		
			// datatypes for parameters, regexp groups are passed as parameters to parsers
			datatypes: {
				'int':		{
					regexp: /\d+?/,
					parse: function(d) { return parseInt(d, 10); }
				},
				'float':	{
					regexp: /\d+\.\d+?/,
					parse: function(d) { return parseFloat(d); }
				},
				'word':		{
					regexp: /\w+?/
				},
				'string':	{
					regexp: /\w+?/
				},
				'datetime':		{
					regexp: /(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/,
					parse: function(d, yyyy, mm, dd, hh, MM, ss, ms) { 
						return new Date(yyyy, mm - 1, dd, hh, MM, ss, ms); 
					},
					stringify: function(date) {
						return date.toISOString();
					}
				},
				'date':	isoDateTypes.date,
				'dateend': isoDateTypes.dateend
			},
			// object containing all the routes by name
			list: {},
			// current executed route with parameter info
			current: null,
			// reload the current route with same or different parameters
			reload: function(args) {
				if (this.current) {
					args = $.extend(this.current.arguments, args);
					var url = this.current.url(args);
					if (url !== location.hash) {
						location.hash = url;
					} else {
						this.current.execute(args);
					}
				} else {
					location.href.replace(location.href);
				}
			},
			// add a route, they can be named and with default parameters
			add: function(route, name, defaults, func) {
				// parameter overload
				if (typeof(name) === 'function') { func = name; name = undefined; }
				if (typeof(defaults) === 'function') { func = defaults; defaults = undefined; }
				if (typeof(name) === 'object') { defaults = name; name = undefined; }

				// all routes have a name
				if (name === undefined) { name = 'route' + (++routecount); }
				if (route[route.length - 1] !== '/') { route += '/'; }
				
				var regex = /\{\s*?([a-zA-Z0-9:\|\\*\?\.]*?)\s*?\}/gim;
				var items = ['var s="#' + route + '";'];
				var item = route;
				var routeexp = '^' + route;
				var vars = [];

				// find parameters in route and create a regexp
				while (match = regex.exec(item)) {
					var arr = match[1].split(':');
					var first = arr[0];
					var constraint = arr[1];
					items.push('s=s.replace("' + match[0] + '",p.' + first + ');');
					item = item.replace(match[0], '');
					if (constraint) {
						// check for known datatype
						if ($.routes.datatypes[constraint]) {
							constraint = $.routes.datatypes[constraint].regexp.toString();
							constraint = constraint.replace(/\/[gim]+$/g, ''); // Remove flags
							constraint = constraint.replace(/\/$|^\//g, ''); // Wrapping slashes
							constraint = constraint.replace(/[\(\)]/g, ''); // Remove groups
						}
						constraint = '(' + constraint + ')';
					} else {
						constraint = '(.*?)';
					}
					if(defaults && defaults[first]) {
						constraint += '?'; // If there is a default, make parameter optional
					}
					routeexp = routeexp.replace(match[0], constraint);
					vars.push(match[1].split(':'));
					regex.lastIndex = match.index;
				}
				items.push('return s;');

				// find a datatype
				var getDatatype = function(parameter) {
					for (var i = 0, len = vars.length; i < len; i++) {
						if (vars[i][0] === parameter) {
							return $.routes.datatypes[vars[i][1]];
						}
					}
				};

				// prepare parameters for url
				var getParams = function(obj) {
					var args = $.extend({}, defaults, obj), dt;
					for (var item in args) {
						if (args.hasOwnProperty(item)) {
							dt = getDatatype(item);
							if (dt && dt.stringify) {
								args[item] = dt.stringify(args[item]);
							}
						}
					}
					return args;
				};

				// convert route with parameters to url
				var combine = new Function('p', items.join(''));
				var url = function(p) {
					return combine(getParams(p));
				};

				// extract parameters from hash
				var extract = function(hash) {
					// load the defaults
					var context = defaults ? defaults : {};
					// get parameters
					$.each(vars, function(x, vars) {
						var datatype = $.routes.datatypes[vars[1]];
						var val = args[x+1];
						// parse parameter
						if (datatype && datatype.parse) {
							val = [val];
							// get arguments for parse
							if (datatype.regexp) {
								var p = datatype.regexp.exec(args[x+1] || datatype.stringify(defaults[vars[x]]));
								for (var y = 1; y < p.length; y++) {
									val.push(p[y]);
								}
							}
							val = datatype.parse.apply(datatype, val);
						}
						context[vars[0]] = val;
					});
					return context;
				};

				// add to list of routes
				return this.list[name] = {
					name: name,
					exp: new RegExp(routeexp, 'i'),
					route: route,
					func: func,
					url: url,
					routeTo: function(data) {
						location.href = this.url(data);
					},
					execute: function(data) {
						this.func.apply($.extend({}, defaults, data));
					},
					vars: vars,
					defaults: defaults,
					level: route.length - route.replace(new RegExp("/", "g"), '').length,
					extract: extract
				};
			},
			addDataType: function(name, dt) {
				$.routes.datatypes[name] = dt;
				createDatatypeArray(name);
			},
			// get a registered route with name
			find: function(name) {
				return this.list[name];
			},
			findRoute: function(hash) {
				var route;
				// search for routes
				$.each(this.list, function(i, match) {
					// check for a match
					var exp = match.exp.exec(hash);
					if (exp) {
						if ((route && match.level > route.level) || !route) {
							route = match;
							args = exp;
						}
					}
				});
				return route;
			},
			// load a hash and find the correct route to execute
			load: function(hash) {
				var route = $.routes.findRoute(hash.substr(1));

				// route not found
				if (!route) { return; }

				// extract parameters from url
				var params = route.extract(hash);

				// execute route
				$.routes.current = route;
				$.routes.current.arguments = params;
				route.execute(params);
			}
		}
	});

	$.expr[':'].hasRoute = function(elem, index, match) {
		return $(elem).has('a[href$=' + location.hash + ']').length > 0;
	};

	$.fn.updateRoutes = function(params) {
		$('a', this).each(function() {
			var item = $(this),
				hash = item.attr('href').substr(1),
				route = $.routes.findRoute(hash);
			if (!route) { return; }

			var linkparams = route.extract(hash);
			var newhash = route.url($.extend({}, linkparams, params));
			item.attr('href', newhash);
		});
	};

	function createDatatypeArray(name) {
		var dt = $.routes.datatypes[name];
		$.routes.datatypes[name + 'array'] = {
			datatype: name,
			regexp: new RegExp('[' + dt.regexp.toString().slice(1, dt.regexp.toString().length - 1) + '\\/\?]*', 'i'),
			parse: function(d) {
				var arr = d.split('/'),
					newarr = [],
					dt = $.routes.datatypes[this.datatype];
				for (var i = 0; i < arr.length; i++) {
					var groups = dt.regexp.exec(arr[i]).slice(1);
					var args = [arr[i]].concat(groups);
					newarr.push(dt.parse.apply(dt, args));
				}
				return newarr;
			},
			stringify: function(arr) {
				for (var i = 0; i < arr.length; i++) {
					var dt = $.routes.datatypes[this.datatype];
					arr[i] = (!!dt.stringify ? dt.stringify(arr[i]) : arr[i].toString());
				}
				return arr.join('/');
			}
		};
	}

	// create array data types
	var dts = $.extend({},$.routes.datatypes);
	for (var name in dts) {
		if (dts.hasOwnProperty(name)) {
			createDatatypeArray(name);
		}
	}

	// Listen for hash change event
	$(window).bind('hashchange', function() {
		$.routes.load(location.hash);
	});

	// Run route on document ready
	$(function() {
		var hash = location.hash;
		if (hash.length > 0) {
			if(hash[hash.length-1] !== '/'){
				hash += '/';
			}
			$.routes.load(hash);
		}
	});
}(jQuery));