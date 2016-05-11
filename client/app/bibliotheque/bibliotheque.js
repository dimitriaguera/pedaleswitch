'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('bibliotheque', {
        url: '/bibliotheque',
        template: '<bibliotheque></bibliotheque>'
      });
  });
