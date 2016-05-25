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
        addToTable: '&',
        onCompo: '&',
        onEffet: '&',
        leaveEffet: '&'
      },
      controller: PanierDessin,
    });

})();