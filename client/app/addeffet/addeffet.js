'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('effets', {
        url: '/effets',
        template: '<addeffet></addeffet>'
      })
      .state('editionEffet', {
        url: '/edition-effet',
        template: '<editeffet></editeffet>',
        params: {
          entity: null,
          types: null,
          nouv: null
        }
      });
  });
