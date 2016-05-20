'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('pageDessin', {
        url: '/pageDessin',
        template: '<page-dessin></page-dessin>'
      });
  });
