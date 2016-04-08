import { User } from '../models/User.js';

class UserService {
  constructor($http, URLS) {
    this._$http = $http;
    this._URLS = URLS;
    this._users = new Map();
  }

  async fetchUser(id) {
    try {
      const response = await this._$http({
        method: 'GET',
        url: this._URLS.BASE + '/api/v1/user/get_user/',
        withCredentials: true,
        params: {
          id: id,
        },
      });
      const obj = response.data.result;
      const user = User.fromJSONObject(obj);
      this._users.set(user.id, user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUser(id) {
    if (this._users.has(id)) {
      return this._users.get(id);
    }

    try {
      return this.fetchUser(id);
    } catch (exception) {
      throw exception;
    }
  }

  clearUsers() {
    this._users.clear();
  }
}

const service = ($http, URLS) => new UserService($http, URLS);
service.$inject = ['$http', 'URLS'];

export { service as UserService };
