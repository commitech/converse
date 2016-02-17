var module = angular.module('converse')
.factory('login', ['$http', 'URLS', function($http, URLS) {
  return function(username, password) {
    return $http({
      method: 'POST',
      url: URLS.BASE + '/api/v1/user/login/?username=' + username + '&password=' + password,
      withCredentials: true
    });
  }
}]);
