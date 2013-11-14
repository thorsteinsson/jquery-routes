jQuery(function($){
	var timeout = 1000;

	test('call a simple route', 3, function() {
		stop(timeout);
		$.routes.add('/route', 'simple', function() {
			ok(true, 'Route was called');
			start();
		});
		
		$.routes.find('simple').routeTo();
		
		stop(timeout);
		window.location.hash = '#/route';
		
		stop(timeout);
		window.location.hash = '#/route/';	
	});

	test('call a route with param', 1, function() {
		stop(timeout);
		$.routes.add('/{param}:test/', 'param', function() {
			equals( this.param, 'test', 'We got the correct parameter' );
			start();	
		});
		$.routes.find('param').routeTo({ param: 'test' });
	});
	
	test('date parameter', 10, function() {
		stop(timeout);
		$.routes.add('/date/{d:date}', 'date', function() {
			equals( typeof(this.d), 'object', 'Date converter working' );
			equals( this.d.toString(), new Date(2001, 0, 1).toString(), 'Date value correct' );
			start();
		});
		$.routes.find('date').routeTo({ d: new Date(2001, 0, 1) });
		
		stop(timeout);
		window.location.hash = '#/date/2001-01-01';
		
		stop(timeout);
		window.location.hash = '#/date/2001-01-01/';
		
		stop(timeout);
		window.location.hash = '#/date/2001-1-1';
		
		stop(timeout);
		window.location.hash = '#/date/2001-1-1/';
	});
	
	test('datetime parameter', 6, function() {
		stop(timeout);
		$.routes.add('/datetime/{d:datetime}', 'datetime', function() {
			equals( typeof(this.d), 'object', 'Date converter working' );
			equals( this.d.toISOString(), new Date(1980, 0, 28, 23, 5, 55, 750).toISOString(), 'Date value correct' );
			start();
		});
		$.routes.find('datetime').routeTo({ d: new Date(1980, 0, 28, 23, 5, 55, 750) });
		
		stop(timeout);
		window.location.hash = '#/datetime/1980-01-28T23:05:55.750Z';
		
		stop(timeout);
		window.location.hash = '#/datetime/1980-01-28T23:05:55.750Z/';
	});
	
	test('int parameter', 6, function() {
		stop(timeout);
		$.routes.add('/{i:int}', 'int', function() {
			equals( typeof(this.i), 'number', 'Int converter working' );
			equals( this.i, 2, 'Int value correct' );
			start();
		});
		$.routes.find('int').routeTo({ i: 2 });
		
		stop(timeout);
		window.location.hash = '#/2';
		
		stop(timeout);
		window.location.hash = '#/2/';
	});
	
	test('float parameter', 6, function() {
		stop(timeout);
		$.routes.add('/{f:float}', 'float', function() {
			equals( typeof(this.f), 'number', 'Float converter working' );
			equals( this.f, 3.23, 'Float value correct' );
			start();
		});
		$.routes.find('float').routeTo({ f: 3.23 });
		
		stop(timeout);
		window.location.hash = '#/3.23';
		
		stop(timeout);
		window.location.hash = '#/3.23/';
	});
	
	test('word parameter', 3, function() {
		stop(timeout);
		$.routes.add('/w0rd/{w:word}', 'word', function() {
			equals( typeof(this.w), 'string', 'Word converter working' );
			start();
		});
		$.routes.find('word').routeTo({ w: 'foo' });
		
		stop(timeout);
		window.location.hash = '#/w0rd/foo';
		
		stop(timeout);
		window.location.hash = '#/w0rd/foo/';
	});
	
	test('date parameter with default value', 4, function() {
		stop(timeout);
		$.routes.add('/test/{d:date}', 'default', { d: new Date(2011,1,14) }, function() {
			equals( typeof(this.d), 'object', 'Object found' );
			var correctDate = new Date(2011,1,14);
			equals( this.d.getFullYear(), correctDate.getFullYear(), 'Correct year' );
			equals( this.d.getMonth(), correctDate.getMonth(), 'Correct month' );
			equals( this.d.getDate(), correctDate.getDate(), 'Correct day' );
			start();
		});
		
		$.routes.find('default').routeTo();
	});
	
	test('array of integers', 12, function() {
		stop(timeout);
		$.routes.add('/array/int/{ids:intarray}', 'intarray', function() {
			equals( typeof(this.ids), typeof([]), 'Array found' );
			equals( this.ids[0], 1, 'First element correct' );
			equals( this.ids[1], 2, 'Second element correct' );
			equals( this.ids[2], 3, 'Third element correct' );
			start();
		});
		$.routes.find('intarray').routeTo({ ids: [1, 2, 3] });
		
		stop(timeout);
		window.location.hash = '#/array/int/[1/2/3';
		
		stop(timeout);
		window.location.hash = '#/array/int/1/2/3/';
	});
	
	test('array of dates', 21, function() {
		stop(timeout);
		$.routes.add('/array/date/{d:datearray}', 'dates', function() {
			equals( typeof(this.d), typeof([]), 'Array found' );
			equals( this.d[0].getFullYear(), 2011, 'Correct year' );
			equals( this.d[0].getMonth(), 0, 'Correct month' );
			equals( this.d[0].getDate(), 1, 'Correct day' );
			equals( this.d[1].getFullYear(), 2010, 'Correct year' );
			equals( this.d[1].getMonth(), 11, 'Correct month' );
			equals( this.d[1].getDate(), 24, 'Correct day' );
			start();
		});
		
		$.routes.find('dates').routeTo({ d: [new Date(2011, 0, 1), new Date(2010, 11, 24)] });
		
		stop(timeout);
		window.location.hash = '#/array/date/2011-01-01/2010-12-24';
		
		stop(timeout);
		window.location.hash = '#/array/date/2011-01-01/2010-12-24/';
	});
	
	setTimeout(function() {
		location.hash = '';
	}, 3000);
});