jQuery(function($){
	var timeout = 3000;

	test("call a simple route", 3, function() {
		stop(timeout);
		$.routes.add('/route', 'simple', function() {
			ok(true, 'Route was called');
		});
		
		$.routes.find('simple').routeTo();
		window.location.hash = '#/route';
		window.location.hash = '#/route/';
		
		start();
	});

	test("call a route with param", 1, function() {
		stop(timeout);
		$.routes.add('/{param:test}/', 'testroute1', function() {
			equals( this.param, "test", "We got the correct parameter" );
			start();	
		});
		$.routes.find('testroute1').routeTo({ param: 'test' });
	});
	
	test("date parameter", 2, function() {
		stop(timeout);
		$.routes.add('/{d:date}/', 'testroute2', function() {
			equals( typeof(this.d), 'object', "Date converter working" );
			equals( this.d.toString(), new Date(2001, 1, 1).toString(), "Date value correct" );
			start();
		});
		$.routes.find('testroute2').routeTo({ d: new Date(2001, 1, 1) });
	});
	
	test("int parameter", 2, function() {
		stop(timeout);
		$.routes.add('/{i:int}/', 'testroute4', function() {
			equals( typeof(this.i), 'number', "Int converter working" );
			equals( this.i, 2, "Int value correct" );
			start();
		});
		$.routes.find('testroute4').routeTo({ i: 2 });
	});
	
	test("float parameter", 2, function() {
		stop(timeout);
		$.routes.add('/{f:float}/', 'testroute5', function() {
			equals( typeof(this.f), 'number', "Float converter working" );
			equals( this.f, 3.23, "Float value correct" );
			start();
		});
		$.routes.find('testroute5').routeTo({ f: 3.23 });
	});
	
	test("word parameter", 1, function() {
		stop(timeout);
		$.routes.add('/w0rd/{w:word}/', 'testroute3', function() {
			equals( typeof(this.w), 'string', "Word converter working" );
			start();
		});
		$.routes.find('testroute3').routeTo({ w: 'foo' });
	});
	
	test("date parameter with default value", 4, function() {
		stop(timeout);
		$.routes.add('/test/{d:date}/', { d: new Date(2011,1,14) }, function() {
			equals( typeof(this.d), 'object', "Object found" );
			var correctDate = new Date(2011,1,14);
			equals( this.d.getFullYear(), correctDate.getFullYear(), "Correct year" );
			equals( this.d.getMonth(), correctDate.getMonth(), "Correct month" );
			equals( this.d.getDate(), correctDate.getDate(), "Correct day" );
			start();
		}).routeTo();
	});
	
	test("array of integers", 4, function() {
		stop(timeout);
		$.routes.add('/array/int/{ids:intarray}/', function() {
			equals( typeof(this.ids), typeof([]), "Array found" );
			equals( this.ids[0], 1, "First element correct" );
			equals( this.ids[1], 2, "Second element correct" );
			equals( this.ids[2], 3, "Third element correct" );
			start();
		}).routeTo({ ids: [1, 2, 3] });
	});
	
	test("array of dates", 7, function() {
		stop(timeout);
		$.routes.add('/array/date/{ids:datearray}/', function() {
			equals( typeof(this.ids), typeof([]), "Array found" );
			equals( this.ids[0].getFullYear(), 2011, "Correct year" );
			equals( this.ids[0].getMonth(), 0, "Correct month" );
			equals( this.ids[0].getDate(), 1, "Correct day" );
			equals( this.ids[1].getFullYear(), 2010, "Correct year" );
			equals( this.ids[1].getMonth(), 11, "Correct month" );
			equals( this.ids[1].getDate(), 24, "Correct day" );
			start();
		}).routeTo({ ids: [new Date(2011, 0, 1), new Date(2010, 11, 24)] });
	});
	
	setTimeout(function() {
		location.hash = '';
	}, 3000);
});