'use strict';
(function(){

  class NavigationDessin {
    constructor() {

    }
  }

  angular.module('pedaleswitchApp')
    .component('navigationDessin', {
      templateUrl: 'app/pageDessin/navigation-dessin/navigation-dessin.html',
      bindings: {
        zoom: '<',
        zoomAdd: '&',
        load: '&',
        save: '&',
        up: '&',
        down: '&',
        right: '&',
        left: '&',
        top: '&',
        bottom: '&'
      },
      controller: NavigationDessin
    });

})();