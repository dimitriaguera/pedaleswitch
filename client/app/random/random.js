'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('random', {
        url: '/random',
        template: '<random></random>'
      });
  });
