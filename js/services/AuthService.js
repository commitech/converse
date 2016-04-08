import { User } from '../models/User';
class AuthService {
  constructor($http, URLS) {
    this._$http = $http;
    this._URLS = URLS;
  }

  async login(username, password) {
    this._$http({
      method: 'POST',
      url: this._URLS.BASE + '/api/v1/user/login/?username=' + username + '&password=' + password,
      withCredentials: true,
    })
    .then((response) => {
      return response;
    }, (error) => {
      throw error;
    });
  }

  async me() {
    try {
      const response = await this._$http({
        method: 'GET',
        url: this._URLS.BASE + '/api/v1/user/me/',
        withCredentials: true,
      });
      const user = User.fromJSONObject(response.data.result);
      return user;
    } catch (error) {
      throw error;
    }
  }
}

const service = ($http, URLS) => new AuthService($http, URLS);
service.$inject = ['$http', 'URLS'];

export {service as AuthService};
