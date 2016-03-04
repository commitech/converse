var module = angular.module('converse')
.factory('DutyService', ['$http', 'URLS', function($http, URLS) {
  return {
    getDutySchedule: function(day, month, year) {
      return $http({
        method: 'GET',
        url: URLS.BASE + '/api/v1/duty/get_duty_schedule/',
        withCredentials: true,
        params: {
          day: day,
          month: month,
          year: year
        }
      });
    },
    getDuty: function(id) {
      return $http({
        method: 'GET',
        url: URLS.BASE + '/api/v1/duty/get_duty/',
        withCredentials: true,
        params: {
          id: id
        }
      });
    }

  }
}]);
