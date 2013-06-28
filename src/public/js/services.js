angular.module('pocServices', ['ngResource']).factory('Beneficiary', function($resource) {
	/*return $resource(defaultPrefix, {}, {
		query : {
			method : 'GET', isArray : true, params : {}
		}
	});*/
}); 

var rootService = "http://localhost:9200";


angular.module('quickcookingService', ['ng']).factory('Store', function($http) {
	return  {
		put : function(data) {
			return $http.post(rootService+"/recettes/misc", data);
		},
		remove: function(id) {
			return $http.delete(rootService+"/recettes/misc/"+id);
		},
		get : function(id) {
			return $http.get(rootService+"/recettes/misc/"+id);
		},

		search: function(criteria) {

			var params = {
				query: {
					"query_string" : {
						"default_field" : "_all",
						"query": "*"+criteria+"*"
					}
				},

				"highlight" : {
					"fields": {
						"content":{}
					}
				}
				/*
				*/
			};

			return $http.post(rootService+"/recettes/misc/_search?pretty=true", params);	
		}
	}
})