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
        textDeco:'=',
        addTextToTable: '&',
        removeTextToTable: '&',
        shapeDeco:'=',
        addShapeToTable: '&',
        removeShapeToTable: '&',
        boite:'<',
        draw:'&'
      },
      controller: DecoDessin
    });

})();