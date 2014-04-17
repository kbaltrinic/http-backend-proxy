'use strict';


// Declare app level module which depends on filters, and services
angular.module('app', [
  'ngMockE2E'
]).controller('appCtrl', ['$scope', '$http', function($scope, $http) {

	$scope.prettyPrint || ($scope.prettyPrint = false);

	$scope.request || ($scope.request = { method: '', url: '', headers: '', data: ''});

	var format = $scope.format = function (obj){
		return $scope.prettyPrint
			? JSON.stringify(obj, null, 2)
			: JSON.stringify(obj)
	};

	$scope.$watch('prettyPrint', function() {
		if($scope.response){
			$scope.response = {
				data: format($scope.rawResponse.data),
				status: $scope.response.status,
				headers: format($scope.rawResponse.headers)
			};
		}
	});

	$scope.call = function(){

		delete $scope.response;

		var request = angular.copy($scope.request);

		request.url = '/' + request.url;

		var headerRegex = /^\s*([^:\s]+)\s*:\s*(.*)\s*$/mg;
		request.headers = {};
		var header;
		while(header = headerRegex.exec(request.headers)){
			request.headers[header[1]] = header[2];
		}

		function recordResponse(data, status, headers) {

			headers = headers ? headers() : undefined;
			$scope.rawResponse = {
				data: data,
				headers: headers
			};

			$scope.response = {
				data: format(data),
				status: status,
				headers: format(headers)
			};
		}

		$http(request).success(recordResponse).error(recordResponse);
	};

}]).run(function($httpBackend) {

	//Must expose this so that it is accessible to remotely invoked javascript.
	window.$httpBackend = $httpBackend

    $httpBackend.whenGET('/test').respond(
    	200, {
    	msg: "You called /test",
    	args: null
    }, {'test-header': 'success'});

    $httpBackend.whenGET('/missing').respond(
    	404,
    	"You called /missing",
    	{'test-header': 'failed'});
});
