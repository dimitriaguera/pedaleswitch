'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('useradmin', {
        url: '/useradmin',
        template: '<useradmin></useradmin>'
      });
  });