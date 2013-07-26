'use strict';


var IndexCtrl = function($scope, $location, $rootScope, $cookies, Store) {

	

	$scope.takeSuggest = function(suggestion) {
		//instant feedback by removing suggest
		$scope.suggestSpell = [];
		$scope.queryP = suggestion; 
		$scope.search(suggestion);
	}

	$scope.__search = function(criteria) {

		$scope.loading = true;

		if(criteria == "") { //if not criteria... wildcard it !
			criteria = "*";
		}

		$scope.suggestSpell = [];

		Store.search(criteria).success(function(data, status, headers, config) {

				$scope.loading = false;

				console.log("launch search "+criteria);
				console.log(data);

				$scope.result = _.map(data.response.docs, function(elt) {
					var res = elt; 
					return res;
				});

				//retrieve suggestion
				if (data.spellcheck)  {
					_.map(data.spellcheck.suggestions, function(elt) {
						if (elt[0] == "collationQuery") {
							$scope.suggestSpell.push(elt[1]);
						}
					});
				}

			

		}).error(function (data, status, headers, config) {

		});

		$scope.$digest();
	}
	$scope.search = _.debounce($scope.__search, 300);

	$scope.search("*");

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
		console.log(data);
		$scope.receip = data.response.docs[0];
		console.log($scope.receipt);
	}).error(function (data, status, headers, config) {

	});

	$scope.save = function(data) {
		$scope.realSave(data);
	}

	$scope.realSave = function(data) {

		Store.put(data);
		$location.path("/");
	}
}


var ViewCtrl = function(Store, $scope, $routeParams, $location) {
	Store.get($routeParams.id).success(function(data, status, headers, config) {
		console.log(data);
		$scope.receip = data.response.docs[0];
		console.log($scope.receipt);
	}).error(function (data, status, headers, config) {

	});
}

