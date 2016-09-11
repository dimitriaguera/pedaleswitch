'use strict';

angular.module('pedaleswitchApp', [
  'pedaleswitchApp.auth',
  'pedaleswitchApp.admin',
  'pedaleswitchApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match',
  'color.picker',
  'jdFontselect',
  'smart-table'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
