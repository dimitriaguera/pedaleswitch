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
        deco: '=',
        switchDeco: '&',
        debrayable: '=',
        switchDeb: '&',
        isActive: '<',
        activeEffet: '&',
        activeCompo: '&'
      },
      controller: MenuDessin
    });

})();