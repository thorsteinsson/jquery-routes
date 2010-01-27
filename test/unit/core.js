jQuery(function($){
	asyncTest("call a simple route", function() {
		expect(1);
		$.routes.add(function() {
			ok(true, "Route was called");
			start();
		}, '/route/', 'route');
		$.routes.get('route').routeTo();
	});

	asyncTest("call a route with param", function() {
		expect(1);
		$.routes.add(function() {
			equals( this.param, "test", "We got the correct parameter" );
			start();	
		}, '/{param:test}/', 'testroute1');
		$.routes.get('testroute1').routeTo({ param: 'test' });
	});
	
	asyncTest("date parameter", function() {
		expect(2);
		$.routes.add(function() {
			equals( typeof(this.d), 'object', "Date converter working" );
			equals( this.d.toString(), new Date(2001, 1, 1).toString(), "Date value correct" );
			start();
		}, '/{d:date}/', 'testroute2');
		$.routes.get('testroute2').routeTo({ d: '01.01.2001' });
	});
	asyncTest("int parameter", function() {
		expect(2);
		$.routes.add(function() {
			equals( typeof(this.i), 'number', "Int converter working" );
			equals( this.i, 2, "Int value correct" );
			start();
		}, '/{i:int}/', 'testroute4');
		$.routes.get('testroute4').routeTo({ i: 2 });
	});
	asyncTest("float parameter", function() {
		expect(2);
		$.routes.add(function() {
			equals( typeof(this.f), 'number', "Float converter working" );
			equals( this.f, 3.23, "Float value correct" );
			start();
		}, '/{f:float}/', 'testroute5');
		$.routes.get('testroute5').routeTo({ f: 3.23 });
	});
	asyncTest("word parameter", function() {
		expect(1);
		$.routes.add(function() {
			equals( typeof(this.w), 'string', "Word converter working" );
			start();
		}, '/{w:word}/', 'testroute3');
		$.routes.get('testroute3').routeTo({ w: 'foo' });
	});
});