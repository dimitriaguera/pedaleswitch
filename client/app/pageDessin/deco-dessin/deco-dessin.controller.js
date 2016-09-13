'use strict';
(function(){

  class DecoDessin {
    constructor() {

    }
  }

  angular.module('pedaleswitchApp')
    .component('decoDessin', {
      templateUrl: 'app/pageDessin/deco-dessin/deco-dessin.html',
      bindings: {
        addTextToTable: '&',
        removeTextToTable: '&',
        items:'=',
        boite:'<',
        draw:'&'
      },
      controller: DecoDessin
    });

})();