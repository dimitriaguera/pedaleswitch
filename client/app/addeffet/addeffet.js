'use strict';

angular.module('pedaleswitchApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('addeffet', {
        url: '/addeffet',
        template: '<addeffet></addeffet>'
      })
      .state('addeffet.edit', {
        url: "/edit",
        template: '<editeffet></editeffet>',
        params: {
          entity: null,
          types: null,
          nouv: null,
        },
      });
  });
