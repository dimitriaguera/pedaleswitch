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
        rotate: '&',
        eyedropper: '&',
        datachange: '&'
        //changeFontSize: 'changeFontSize({value:value, data:data})'
      },
      controller: ModifDessin
    });

})();