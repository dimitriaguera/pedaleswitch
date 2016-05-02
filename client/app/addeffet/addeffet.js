'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('addeffet', {
        url: '/addeffet',
        template: '<addeffet></addeffet>'
      });
  });
