'use strict';
(function(){

  class DecoDessin {
    constructor() {
      this.shape = "'Rectangle'";
      this.color = '#FF0000';
      this.lineWidth = 1;
      this.fillColor = '#000000';
    }
  }

  angular.module('pedaleswitchApp')
    .component('decoDessin', {
      templateUrl: 'app/pageDessin/deco-dessin/deco-dessin.html',
      bindings: {
        boite:'<',
        draw:'&',
        switchDecoSub:'&',
        textDeco:'=',
        addTextToTable: '&',
        removeTextToTable: '&',
        shapeDeco:'=',
        addShapeToTable: '&',
        removeShapeToTable: '&',
        addImgToTable:'&'
      },
      controller: DecoDessin
    });

})();