'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('composant', {
        url: '/composant',
        template: '<composant></composant>'
      });
  });
