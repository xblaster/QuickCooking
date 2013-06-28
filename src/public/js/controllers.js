'use strict';


var IndexCtrl = function($scope, $location, $rootScope, $cookies, Store) {

	$scope.search = function(criteria) {


		Store.search(criteria).success(function(data, status, headers, config) {

			$scope.result = _.map(data.hits.hits, function(elt) {
				var res = elt._source;
				res._id = elt._id
				res.highlights = elt.highlight.content;

				return res;
				//return elt.highlight;
			})
		}).error(function (data, status, headers, config) {

		});
	}

	$scope.search("");

	$scope.remove = function(id) {
		Store.remove(id).success(function(data, status, headers, config) {
			//after remove, refresh
			$scope.search("");
		}).error(function (data, status, headers, config) {
			$scope.search("");
		});
	}
}

var AddCtrl = function(Store, $scope, $location) {

	$scope.save = function(data) {
		
		Store.put(data);
		$location.path("/");
	}
}

var EditCtrl = function(Store, $scope, $routeParams, $location) {
	Store.get($routeParams.id).success(function(data, status, headers, config) {
			$scope.receip = data._source;
	}).error(function (data, status, headers, config) {

	});

	$scope.save = function(data) {
		$scope.realSave(data);
		Store.remove($routeParams.id).success(function(data, status, headers, config) {
			//after remove, refresh
			
		}).error(function (data, status, headers, config) {
			//$scope.realSave(data);
		});

		
	}

	$scope.realSave = function(data) {

		Store.put(data);
		$location.path("/");
	}
}

