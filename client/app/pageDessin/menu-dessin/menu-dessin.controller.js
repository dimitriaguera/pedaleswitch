'use strict';
(function(){

  class MenuDessin {
    constructor() {

    }

  }

  angular.module('pedaleswitchApp')
    .component('menuDessin', {
      templateUrl: 'app/pageDessin/menu-dessin/menu-dessin.html',
      bindings: {
        isActive: '<',
        debrayable: '=',
        switchDeb: '&',
        activeEffet: '&',
        activeCompo: '&'
      },
      controller: MenuDessin,
    });

})();