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
        composantItems: '<',
        selections: '<',
        addToTable: '&',
        removeToTable: '&',
        removeToSelection: '&',
        updateComposant: '&',
        onCompo: '&',
        onEffet: '&',
        leaveEffet: '&',
        actions: '='
      },
      controller: PanierDessin
    });

})();