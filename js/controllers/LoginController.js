class LoginController {
  constructor($state, $http, AuthService, URLS) {
    this._$state = $state;
    this._$http = $http;
    this._AuthService = AuthService;
    this._URLS = URLS;
    this.credentials = {
      username: '',
      password: '',
    };
  }

  login() {
    this._AuthService.login(
      this.credentials.username,
      this.credentials.password
    ).then((response) => {
      this.loginResponse = response;
      this._$state.go('home', null, {reload: true});
    }, (error) => {
      this.loginError = error;
    });
  }
}

LoginController.$inject = ['$state', '$http', 'AuthService', 'URLS'];
export { LoginController };
