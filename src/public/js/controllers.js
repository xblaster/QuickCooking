'use strict';


var IndexCtrl = function($scope, $location, $rootScope, $cookies, Store) {

	$scope.search = function(criteria) {


		Store.search(criteria).success(function(data, status, headers, config) {

			$scope.result = _.map(data.hits.hits, function(elt) {
				var res = elt._source;
				res.highlights = elt.highlight.content;

				return res;
				//return elt.highlight;
			})
		}).error(function (data, status, headers, config) {

		});
	}
}

var AddCtrl = function(Store, $scope) {

	$scope.save = function(data) {
		console.log("lol");
		Store.put(data);
	}
}

