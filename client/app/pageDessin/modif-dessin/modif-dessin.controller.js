'use strict';
(function(){

  class ModifDessin {
    constructor() {
    }
  }

  angular.module('pedaleswitchApp')
    .component('modifDessin', {
      templateUrl: 'app/pageDessin/modif-dessin/modif-dessin.html',
      bindings: {
        data: '=',
        actions: '='
      },
      controller: ModifDessin
    });

})();