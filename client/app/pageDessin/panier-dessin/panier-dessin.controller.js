'use strict';
(function(){

  class PanierDessin {
    constructor() {
      this.newItem = '';
    }
  }

  angular.module('pedaleswitchApp')
    .component('panierDessin', {
      templateUrl: 'app/pageDessin/panier-dessin/panier-dessin.html',
      bindings: {
        items: '<',
        effets: '<',
        chgmtitem: '&',
        addToTable: '&'
      },
      controller: PanierDessin,
    });

})();