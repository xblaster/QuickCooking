angular.module('pocServices', ['ngResource']).factory('Beneficiary', function($resource) {
	/*return $resource(defaultPrefix, {}, {
		query : {
			method : 'GET', isArray : true, params : {}
		}
	});*/
}); 

//var rootService = "http://localhost:9200";
//var rootService = "http://localhost:8983/solr";
var rootService = "";


angular.module('quickcookingService', ['ng']).factory('Store', function($http) {
	return  {
		put : function(data) {
			//var params = {'add': data};
			params = data;
			console.log(params);
			return $http.post(rootService+"/add", params);
		},
		remove: function(id) {
			return $http.post(rootService+"/delete", {"id":id});
		},
		get : function(id) {
			//http://localhost:8983/solr/get?id=1234768.7058315673
			return $http.get(rootService+"/get?id="+id);
		},

		search: function(criteria) {

			/*var params = {
				'q' : criteria
			};*/

			return $http.get(rootService+"/search?q="+criteria);	
		}
	}
})