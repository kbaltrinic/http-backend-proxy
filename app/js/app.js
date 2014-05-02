'use strict';


// Declare app level module which depends on filters, and services
angular.module('app', [
  'ngMockE2E'
]).value()
.controller('appCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.version = angular.version;

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

  if($scope.$root.initialRequest){
    $scope.request = angular.extend($scope.request, $scope.$root.initialRequest.request);
    $scope.$root.$watch('initialRequest.response', function(){
      var response = $scope.$root.initialRequest.response;
      if(response){
        recordResponse(response.data, response.status, response.headers);
      }
    });
  }

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

    $http(request).success(recordResponse).error(recordResponse);
  };

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

}]).run(function($httpBackend, $window, $rootScope, $http) {

    $httpBackend.whenGET('/test').respond(
      200, {
      msg: "You called /test",
      args: null
    }, {'test-header': 'success'});

    $httpBackend.whenGET('/missing').respond(
      404,
      "You called /missing",
      {'test-header': 'failed'});

  if($window.location.search.length > 1){
    var request;
    try{
      request = JSON.parse(decodeURI($window.location.search.substring(1)));
    } catch (ex) {
      console.log(ex);
    }

    if(request){
      $rootScope.initialRequest = { request: request };

      $http(request).success(function(data, status, headers){
        $rootScope.initialRequest.response = {
          data: data,
          status: status,
          headers: headers
        };
      }).error(function(data, status, headers){
        $rootScope.initialRequest.response = {
          data: data || '<NO RESPONSE RECEIVED>',
          status: status || 5000,
          headers: headers
        };
      });
    }
  }
});
