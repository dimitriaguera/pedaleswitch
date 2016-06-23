'use strict';
(function(){

  class ModifDessin {
    constructor() {
      //@todo a sup
      var x = 5;
    }
  }

  angular.module('pedaleswitchApp')
    .component('modifDessin', {
      templateUrl: 'app/pageDessin/modif-dessin/modif-dessin.html',
      bindings: {
        data: '=',
        datachange: '&',
        rotate: '&'
      },
      controller: ModifDessin
    });

})();