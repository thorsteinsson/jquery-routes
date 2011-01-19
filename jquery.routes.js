/*
 * jQuery hashchange event - v1.2 - 2/11/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,i,b){var j,k=$.event.special,c="location",d="hashchange",l="href",f=$.browser,g=document.documentMode,h=f.msie&&(g===b||g<8),e="on"+d in i&&!h;function a(m){m=m||i[c][l];return m.replace(/^[^#]*#?(.*)$/,"$1")}$[d+"Delay"]=100;k[d]=$.extend(k[d],{setup:function(){if(e){return false}$(j.start)},teardown:function(){if(e){return false}$(j.stop)}});j=(function(){var m={},r,n,o,q;function p(){o=q=function(s){return s};if(h){n=$('<iframe src="javascript:0"/>').hide().insertAfter("body")[0].contentWindow;q=function(){return a(n.document[c][l])};o=function(u,s){if(u!==s){var t=n.document;t.open().close();t[c].hash="#"+u}};o(a())}}m.start=function(){if(r){return}var t=a();o||p();(function s(){var v=a(),u=q(t);if(v!==t){o(t=v,u);$(i).trigger(d)}else{if(u!==t){i[c][l]=i[c][l].replace(/#.*/,"")+"#"+u}}r=setTimeout(s,$[d+"Delay"])})()};m.stop=function(){if(!n){r&&clearTimeout(r);r=0}};return m})()})(jQuery,this);

/*
 * jQuery routes - v1.0
 * Routing in javascript using hashchange event.
 * http://thorsteinsson.is/projects/jquery-routes/
 *
 * Copyright (c) 2010 Ægir Þorsteinsson
 * Licensed under a Creative Commons Attribution 3.0 license
 * http://creativecommons.org/licenses/by/3.0/
 */
(function($) {
	var routecount = 0;
	$.extend({
		routes: {
			// datatypes for parameters, regexp groups are passed as parameters to parsers
			datatypes: {
				'int':		{
					regexp: /\d+?/,
					parser: function(d) { return parseInt(d); }
				},
				'float':	{
					regexp: /\d+\.\d+?/,
					parser: function(d) { return parseFloat(d); }
				},
				'word':		{
					regexp: /\w+?/
				},
				'date':		{
					regexp: /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
					parser: function(d, dd, mm, yyyy) { return new Date(yyyy, mm - 1, dd); }
				},	
				'dateend':  { 
					regexp: /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
					parser: function(d, dd, mm, yyyy) { return new Date(yyyy, mm - 1, dd, 23, 59, 59, 999); }
				}
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
						this.current.routeTo(args);
					} else {
						this.current.execute(args);
					}
				} else {
					location.href.replace(location.href);
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
				
				// find parameters in route and create a regexp
				while (match = regex.exec(item)) {
					var arr = match[1].split(':');
					var first = arr[0];
					var extra = arr[1];
					items.push('s=s.replace("' + match[0] + '",p.' + first + ');');
					item = item.replace(match[0], '');
					if (extra) {
						// check for known datatype
						if ($.routes.datatypes[extra]) {
							extra = $.routes.datatypes[extra].regexp.toString();
							extra = extra.substring(1, extra.length - 2).replace(/\(/g, '').replace(/\)/g, ''); // remove groups
						}
						routeexp = routeexp.replace(match[0], '(' + extra + ')');
					} else {
						routeexp = routeexp.replace(match[0], '(.*?)');
					}
					vars.push(match[1].split(':'));
					regex.lastIndex = match.index;
				}
				items.push('return s;');
	
				// add to list of routes
				this.list[name] = {
					name: name,
					exp: new RegExp(routeexp, 'i'),
					route: route,
					func: func,
					url: new Function('p', items.join('')),
					routeTo: function(data) {
						location.href = this.url($.extend({}, this.defaults, data));
					},
					execute: function(data) {
						data = $.extend({}, this.defaults, data);
						this.func.apply(data);
					},
					vars: vars,
					defaults: defaults,
					level: route.length - route.replace(new RegExp("/", "g"), '').length
				};
			},
			// get a registered route with name			
			find: function(name) {
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
						if ((route && match.level > route.level) || !route) {
							route = match;
							args = exp;
						}
					}
				});
				
				// route not found
				if (!route) { return; }
				
				// load the defaults
				var context = route.defaults ? route.defaults : {};
				// get parameters
				$.each(route.vars, function(x, vars) {
					var datatype = $.routes.datatypes[vars[1]];
					var val = args[x+1];
					// parse parameter
					if (datatype && datatype.parser) {
						val = [val];
						// get arguments for parser
						if (datatype.regexp) {
							var p = datatype.regexp.exec(args[x+1]);
							for (var y = 1; y < p.length; y++) {
								val.push(p[y]);
							}
						}
						val = datatype.parser.apply(this, val);
					}
					context[vars[0]] = val;
				});
				
				// execute route
				$.routes.current = route;
				$.routes.current.arguments = context;
				route.execute(context);
			}
		}
	});

	// Listen for hash change event
	$(window).bind('hashchange', function() {
		$.routes.load(location.hash);
	});
	
	// Run route on document ready
	$(function() {
		if (location.hash.length > 0) {
			$.routes.load(location.hash);
		}
	});
}(jQuery));