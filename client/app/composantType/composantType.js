'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('composantType', {
        url: '/composantType',
        template: '<composant-type></composant-type>'
      });
  });
