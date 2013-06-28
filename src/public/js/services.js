angular.module('pocServices', ['ngResource']).factory('Beneficiary', function($resource) {
	/*return $resource(defaultPrefix, {}, {
		query : {
			method : 'GET', isArray : true, params : {}
		}
	});*/
}); 




angular.module('quickcookingService', ['ng']).factory('Store', function($http) {
	return  {
		put : function(data) {
			return $http.post("http://localhost:9200/recettes/misc", data);
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

			return $http.post("http://localhost:9200/recettes/misc/_search?pretty=true", params);	
		}
	}
})