jQuery(function($){
	asyncTest("call a simple route", function() {
		expect(1);
		$.routes.add('/route/', function() {
			ok(true, "Route was called");
			start();
		});
		$.routes.find('route1').routeTo();
	});

	asyncTest("call a route with param", function() {
		expect(1);
		$.routes.add('/{param:test}/', 'testroute1', function() {
			equals( this.param, "test", "We got the correct parameter" );
			start();	
		});
		$.routes.find('testroute1').routeTo({ param: 'test' });
	});
	
	asyncTest("date parameter", function() {
		expect(2);
		$.routes.add('/{d:date}/', 'testroute2', function() {
			equals( typeof(this.d), 'object', "Date converter working" );
			equals( this.d.toString(), new Date(2001, 1, 1).toString(), "Date value correct" );
			start();
		});
		$.routes.find('testroute2').routeTo({ d: new Date(2001, 1, 1) });
	});
	asyncTest("int parameter", function() {
		expect(2);
		$.routes.add('/{i:int}/', 'testroute4', function() {
			equals( typeof(this.i), 'number', "Int converter working" );
			equals( this.i, 2, "Int value correct" );
			start();
		});
		$.routes.find('testroute4').routeTo({ i: 2 });
	});
	asyncTest("float parameter", function() {
		expect(2);
		$.routes.add('/{f:float}/', 'testroute5', function() {
			equals( typeof(this.f), 'number', "Float converter working" );
			equals( this.f, 3.23, "Float value correct" );
			start();
		});
		$.routes.find('testroute5').routeTo({ f: 3.23 });
	});
	asyncTest("word parameter", function() {
		expect(1);
		$.routes.add('/{w:word}/', 'testroute3', function() {
			equals( typeof(this.w), 'string', "Word converter working" );
			start();
		});
		$.routes.find('testroute3').routeTo({ w: 'foo' });
	});
	asyncTest("date parameter with default value", function() {
		expect(4);
		$.routes.add('/test/{d:date}/', { d: new Date(2011,1,14) }, function() {
			equals( typeof(this.d), 'object', "Object found" );
			var correctDate = new Date(2011,1,14);
			equals( this.d.getFullYear(), correctDate.getFullYear(), "Correct year" );
			equals( this.d.getMonth(), correctDate.getMonth(), "Correct month" );
			equals( this.d.getDate(), correctDate.getDate(), "Correct day" );
			start();
		}).routeTo();
	});
});