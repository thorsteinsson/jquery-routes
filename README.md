[jQuery routes](http://thorsteinsson.is/projects/jquery-routes/) - Routing in javascript
================================

Setup
-----
Include the [jQuery](http://jquery.com/) library and the jquery.routes.js file.

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
	<script type="text/javascript" src="jquery.routes.js"></script>

**IE 7 and below**

For legacy browser support, be sure to check out the [jQuery.hashchange](http://benalman.com/projects/jquery-hashchange-plugin/) plugin by Ben Alman. *Note that jQuery 1.9 and above is not supported by that plugin.*

Usage
-----
Link routes to javascript functions. Make sure the functions prepare the ui for this state of the application. Remember that you can go directly to a route without visiting the main route.

	<script type="text/javascript">
	var newsModule = {
		fetch: function() {
			$('#news').load('news.php?id=' + this.id).show();
		}
		fetchAll: function() {
			$('#news').load('news.php').show();
		}
	};

	$.routes.add('/news/{id:int}/', newsModule.fetch);
	$.routes.add('/news/', newsModule.fetchAll);
	</script>

or anonymous functions

	<script type="text/javascript">
	$.routes.add('/news/{id:int}/', function() {
		$('#news').load('news.php?id=' + this.id).show();
	});
	</script>

Parameters are defined with curly braces. The syntax is {name:datatype}. The datatype can be int, float, word, date or you can create your own.
Datatypes are added in $.routes.datatypes and parsers in $.routes.parsers.
The datatype for parameters can also be a regular expression, ex. {page:news|help|about}.
The functions will get named parameters in "this", ex. this.page == 'news'.

Named routes

	<script type="text/javascript">
	// register the route
	$.routes.add('/news/{when:date}/', 'newsByDate', function() {
		alert('loading news from ' + this.when);
	});

	$('#get-news').click(function() {
		// change the url to this route (with this date as parameter)
		$.routes.find('newsByDate').routeTo({
			when: new Date(2010, 1, 19);
		});
	});
	</script>

Use routeTo function to change the url or use execute function to only execute the function for that route.

Tests
----------
Tests are written using QUnit. Open test/index.html to run the tests.

