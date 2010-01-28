[jQuery routes](http://thorsteinsson.is/projects/jquery-routes/) - Routing in javascript
================================

Setup
-----
Include the jQuery(http://jquery.com/) library and the jquery.routes.js file.

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
	<script type="text/javascript" src="jquery.routes.js"></script>

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
	
	$.routes.add(newsModule.fetch, '/news/{id:int}/');
	$.routes.add(newsModule.fetchAll, '/news/');
	</script>

or anonymous functions

	<script type="text/javascript">
	$.routes.add(function() {
		$('#news').load('news.php?id=' + this.id).show();
	}, '/news/{id:int}/');
	</script>

Parameters are defined with curly braces. The syntax is {name:datatype}. The datatype can be int, float, word, date or you can create your own.
Datatypes are added in $.routes.datatypes and parsers in $.routes.parsers.
The datatype for parameters can also be a regular expression, ex. {page:news|help|about}.
The functions will get named parameters in "this", ex. this.page == 'news'. 