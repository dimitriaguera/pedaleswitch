'use strict';

angular.module('pedaleswitchApp.auth', [
  'pedaleswitchApp.constants',
  'pedaleswitchApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
