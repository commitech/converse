var module = angular.module('converse')
.factory('UserService', ['$http', 'URLS', function($http, URLS) {
  return {
    getUser: function(id) {
      return $http({
        method: 'GET',
        url: URLS.BASE + '/api/v1/user/get_user/',
        withCredentials: true,
        params: {
          id: id
        }
      });
    }
  }
}]);
