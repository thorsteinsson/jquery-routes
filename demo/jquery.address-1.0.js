/*
 * jQuery Address Plugin v1.0
 * http://www.asual.com/jquery/address/
 *
 * Copyright (c) 2009 Rostislav Hristov
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License
 *
 * Date: 2009-04-28 16:54:00 +0300 (Tue, 28 Apr 2009)
 * Revision: 399
 */
(function ($) {

    $.address = (function () {
    
        var _trigger = function(name) {
            $(this).trigger(
                $.extend($.Event(name), 
                    (function() {
                        var event = {
                            value: this.value(),
                            path: this.path(),
                            pathNames: this.pathNames(),
                            parameterNames: this.parameterNames(),
                            parameters: {},
                            queryString: this.queryString()
                        };
                        for (var i = 0, l = event.parameterNames.length; i < l; i++)
                            event.parameters[event.parameterNames[i]] = this.parameter(event.parameterNames[i]);
                        return event;
                    }).call(this)
                )
            );
        };
    
        var _init = function() {
            _trigger.call($.address, 'init');
        };
        
        var _change = function() {
            _trigger.call($.address, 'change');
        };

        var _getHash = function() {
            var index = _l.href.indexOf('#');
            return index != -1 ? _ec(_dc(_l.href.substr(index + 1))) : '';
        };
        
        var _getWindow = function() {
            try {
                top.document;
                return top;
            } catch (e) {
                return window;
            }
        };
        
        var _strictCheck = function(value, force) {
            if (_opts.strict)
                value = force ? (value.substr(0, 1) != '/' ? '/' + value : value) : (value == '' ? '/' : value);
            return value;
        };

        var _ieLocal = function(value, direction) {
            return (_msie && _l.protocol == 'file:') ? 
                (direction ? _value.replace(/\?/, '%3F') : _value.replace(/%253F/, '?')) : value;
        };

        var _searchScript = function(el) {
            for (var i = 0, l = el.childNodes.length, s; i < l; i++) {
                if (el.childNodes[i].src)
                    _url = String(el.childNodes[i].src);
                if (s = _searchScript(el.childNodes[i]))
                    return s;
            }
        };

        var _listen = function() {
            if (!_silent) {
                var hash = _getHash();
                var diff = !(_value == hash);
                if (_safari && _version < 523) {
                    if (_length != _h.length) {
                        _length = _h.length;
                        if (typeof _stack[_length - 1] != UNDEFINED)
                            _value = _stack[_length - 1];
                        _update();
                    }
                } else if (_msie && diff) {
                    if (_version < 7)
                        _l.reload();
                    else
                        _setters.value(hash);
                } else if (diff) {
                    _value = hash;
                    _update();
                }
            }
        };

        var _update = function() {
            _change();
            _st(_track, 10);
        };

        var _track = function() {
            var value = (_l.pathname + (/\/$/.test(_l.pathname) ? '' : '/') + _getters.value()).replace(/\/\//, '/').replace(/^\/$/, '');
            var fn = window[_opts.tracker];
            if (typeof fn == FUNCTION)
                fn(value);
            else if (typeof pageTracker != UNDEFINED && typeof pageTracker._trackPageview == FUNCTION)
                pageTracker._trackPageview(value);
            else if (typeof urchinTracker == FUNCTION) 
                urchinTracker(value);
        };
        
        var _htmlWrite = function() {
            var doc = _iframe.contentWindow.document;
            doc.open();
            doc.write('<html><head><title>' + _d.title + '</title><script>var ' + ID + ' = "' + _getHash() + '";</script></head></html>');
            doc.close();
        };

        var _load = function() {
            if (!_loaded) {
                _loaded = true;
                $('a').attr('xref', function() {
                    return $(this).attr('href');
                });
                if (_msie && _version < 8) {
                    _d.body.innerHTML = '<iframe id="' + ID + '" src="javascript:false;" width="0" height="0"></iframe>' + _d.body.innerHTML;
                    _iframe = _d.getElementById(ID);
                    _st(function() {
                        $(_iframe).bind('load', function() {
                            var win = _iframe.contentWindow;
                            var src = win.location.href;
                            _value = (typeof win[ID] != UNDEFINED ? win[ID] : '');
                            if (_value != _getHash()) {
                                _update();
                                _l.hash = _ieLocal(_value, true);
                            }
                        });
                        if (typeof _iframe.contentWindow[ID] == UNDEFINED) 
                            _htmlWrite();
                    }, 50);
                } else if (_safari) {
                    if (_version < 418) {
                        $(_d.body).append('<form id="' + ID + '" style="position:absolute;top:-9999px;" method="get"></form>');
                        _form = _d.getElementById(ID);
                    }
                    if (typeof _l[ID] == UNDEFINED) _l[ID] = {};
                    if (typeof _l[ID][_l.pathname] != UNDEFINED) _stack = _l[ID][_l.pathname].split(',');
                }
                
                _st(function() {
                    _init();
                    _change();
                    _track();
                }, 1);
                
                if (_msie && _version >= 8)
                    _d.body.onhashchange = _listen;
                else
                    _si(_listen, 50);
                    
                $('a').attr('href', function() {
                    return $(this).attr('xref');
                }).removeAttr('xref');
                
                //$('a[rel*=address:]').address();
            }
        };
        
        var _getters = {
            baseURL: function() {
                var url = _l.href;
                if (url.indexOf('#') != -1)
                    url = url.substr(0, url.indexOf('#'));
                if (url.substr(url.length - 1) == '/')
                    url = url.substr(0, url.length - 1);
                return url;
            }, 
            strict: function() {
                return _opts.strict;
            },
            history: function() {
                return _opts.history;
            },
            tracker: function() {
                return _opts.tracker;
            },
            title: function() {
                return _d.title;
            },
            value: function() {
                if (!_supported) return null;
                return _dc(_strictCheck(_ieLocal(_value, false), false));
            },
            path: function() {
                var value = this.value();
                return (value.indexOf('?') != -1) ? value.split('?')[0] : value;
            },
            pathNames: function() {
                var path = this.path();
                var names = path.split('/');
                if (path.substr(0, 1) == '/' || path.length == 0)
                    names.splice(0, 1);
                if (path.substr(path.length - 1, 1) == '/')
                    names.splice(names.length - 1, 1);
                return names;
            },
            queryString: function() {
                var value = this.value();
                var index = value.indexOf('?');
                return (index != -1 && index < value.length) ? value.substr(index + 1) : '';
            },
            parameter: function(param) {
                var value = this.value();
                var index = value.indexOf('?');
                if (index != -1) {
                    value = value.substr(index + 1);
                    var params = value.split('&');
                    var p, i = params.length;
                    while(i--) {
                        p = params[i].split('=');
                        if (p[0] == param)
                            return p[1];
                    }
                }
            },
            parameterNames: function() {
                var value = this.value();
                var index = value.indexOf('?');
                var names = [];
                if (index != -1) {
                    value = value.substr(index + 1);
                    if (value != '' && value.indexOf('=') != -1) {
                        var params = value.split('&');
                        var i = 0;
                        while(i < params.length) {
                            names.push(params[i].split('=')[0]);
                            i++;
                        }
                    }
                }
                return names;
            }        
        };
        
        var _setters = {
            strict: function(strict) {
                _opts.strict = strict;
            },
            history: function(history) {
                _opts.history = history;
            },
            tracker: function(tracker) {
                _opts.tracker = tracker;
            },
            title: function(title) {
                _st(function() {
                    _title = _d.title = title;
                    if (_juststart && _iframe && _iframe.contentWindow && _iframe.contentWindow.document) {
                        _iframe.contentWindow.document.title = title;
                        _juststart = false;
                    }
                    if (!_justset && _mozilla)
                        _l.replace(_l.href.indexOf('#') != -1 ? _l.href : _l.href + '#');
                    _justset = false;
                }, 50);
            },
            value: function(value) {
                value = _ec(_dc(_strictCheck(value, true)));
                if (value == '/') value = '';
                if (_value == value) return;
                _justset = true;
                _value = value;
                _silent = true;
                _update();
                _stack[_h.length] = _value;
                if (_safari) {
                    if (_opts.history) {
                        _l[ID][_l.pathname] = _stack.toString();
                        _length = _h.length + 1;
                        if (_version < 418) {
                            if (_l.search == '') {
                                _form.action = '#' + _value;
                                _form.submit();
                            }
                        } else if (_version < 523 || _value == '') {
                            var evt = _d.createEvent('MouseEvents');
                            evt.initEvent('click', true, true);
                            var anchor = _d.createElement('a');
                            anchor.href = '#' + _value;
                            anchor.dispatchEvent(evt);                
                        } else {
                            _l.hash = '#' + _value;
                        }
                    } else {
                        _l.replace('#' + _value);
                    }
                } else if (_value != _getHash()) {
                    if (_opts.history)
                        _l.hash = '#' + _ieLocal(_value, true);
                    else
                        _l.replace('#' + _value);
                }
                if ((_msie && _version < 8) && _opts.history) {
                    _st(_htmlWrite, 50);
                }
                if (_safari)
                    _st(function(){ _silent = false; }, 1);
                else
                    _silent = false;
            }
        };

        var ID = 'jQueryAddress',
            FUNCTION = 'function',
            UNDEFINED = 'undefined',
            _browser = $.browser, 
            _version = parseFloat($.browser.version),
            _mozilla = _browser.mozilla,
            _msie = _browser.msie,
            _opera = _browser.opera,
            _safari = _browser.safari,
            _supported = false,
            _t = _getWindow(),
            _d = _t.document,
            _h = _t.history, 
            _l = _t.location,
            _si = setInterval,
            _st = setTimeout, 
            _dc = decodeURI,
            _ec = encodeURI,
            _agent = navigator.userAgent,            
            _iframe,
            _form,
            _url,
            _title = _d.title, 
            _length = _h.length, 
            _silent = false,
            _loaded = false,
            _justset = true,
            _juststart = true,
            _stack = [], 
            _listeners = {}, 
            _value = _getHash(),
            _api = {},
            _opts = {history: true, strict: true};
        
        if (_msie)
            _version = parseFloat(_agent.substr(_agent.indexOf('MSIE') + 4));
        
        _supported = 
            (_mozilla && _version >= 1) || 
            (_msie && _version >= 6) ||
            (_opera && _version >= 9.5) ||
            (_safari && _version >= 312);
            
        if (_supported) {
        
            for (var i = 1; i < _length; i++)
                _stack.push('');
                
            _stack.push(_getHash());
        
            if (_msie && _l.hash != _getHash())
                _l.hash = '#' + _ieLocal(_getHash(), true);

            if (_opera) 
                history.navigationMode = 'compatible'; 
            
            _searchScript(document);
            var _qi = _url.indexOf('?');
            if (_url && _qi > -1) {
                var param, params = _url.substr(_qi + 1).split('&');
                for (var i = 0, p; p = params[i]; i++) {
                    param = p.split('=');
                    if (/^(history|strict)$/.test(param[0])) {
                        _opts[param[0]] = (isNaN(param[1]) ? /^(true|yes)$/i.test(param[1]) : (parseInt(param[1]) != 0));
                    }
                    if (/^tracker$/.test(param[0]))
                        _opts[param[0]] = param[1];
                }
            }

            $(_load);
            
        } else if ((!_supported && _l.href.indexOf('#') != -1) || 
            (_safari && _version < 418 && _l.href.indexOf('#') != -1 && _l.search != '')){
            _d.open();
            _d.write('<html><head><meta http-equiv="refresh" content="0;url=' + 
                _l.href.substr(0, _l.href.indexOf('#')) + '" /></head></html>');
            _d.close();
        } else {
            _track();
        }

        $.each(('init,change').split(','), function(i, name){
            _api[name] = function(data, fn){
                $($.address).bind(name, fn || data, fn && data);
                return this;
            };
        });
        
        $.each(('baseURL,strict,history,tracker,title,value').split(','), function(i, name){
            _api[name] = function(value){
                if (typeof value != 'undefined') {
                    if (_supported)
                        _setters[name](value);
                    return $.address;
                } else {
                    return _getters[name]();
                }
            };
        });

        $.each(('path,pathNames,queryString,parameter,parameterNames').split(','), function(i, name){
            _api[name] = function(value){
                return _getters[name](value);
            };
        });
        
        return _api;
        
    })();
    
    $.fn.address = function (fn) {
        $(this).click(function() {
            var value = fn ? fn.call(this) : 
                /address:/.test($(this).attr('rel')) ? $(this).attr('rel').split('address:')[1].split(' ')[0] : 
                $(this).attr('href').replace(/^#/, '');
            $.address.value(value);
            return false;
        });
    };
    
}(jQuery));