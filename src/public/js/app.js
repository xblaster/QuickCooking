'use strict';


//fix ie console
if (typeof console==="undefined"|| typeof console.log === "undefined") {
	console = {}
	console.log = function(){};
}

angular.module('quickcooking', ['ng','ngCookies','quickcookingService']).config(['$routeProvider',
function($routeProvider) {

	$routeProvider.when('/', {templateUrl: 'partials/index.html', controller : IndexCtrl})
	.when('/add', {templateUrl : 'partials/add.html', controller: AddCtrl})
	//.when('/avoir/:id', {templateUrl : 'partials/detailAvoir.html', controller: AvoirDetailCtrl})
	.otherwise({
		redirectTo : '/'
	});
}]);