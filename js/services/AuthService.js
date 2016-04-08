import { User } from '../models/User';
class AuthService {
  constructor($http, URLS) {
    this._$http = $http;
    this._URLS = URLS;
    this._me = null;
  }

  async login(username, password) {
    try {
      const response = await this._$http({
        method: 'POST',
        url: this._URLS.BASE + '/api/v1/user/login/?username=' + username + '&password=' + password,
        withCredentials: true,
      });
      await this.me();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async me() {
    try {
      if (this._me === null) {
        const response = await this._$http({
          method: 'GET',
          url: this._URLS.BASE + '/api/v1/user/me/',
          withCredentials: true,
        });
        const user = User.fromJSONObject(response.data.result);
        this._me = user;
        return user;
      }
      return this._me;
    } catch (error) {
      throw error;
    }
  }
}

const service = ($http, URLS) => new AuthService($http, URLS);
service.$inject = ['$http', 'URLS'];

export {service as AuthService};
