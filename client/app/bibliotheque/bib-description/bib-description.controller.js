'use strict';
(function(){

  class BibDescription {
    constructor() {

    }
    addEffet(){
      alert('Salut Francis, l\'effet a été ajouté dans ton cul. Bise.');
    }
  }

  angular.module('pedaleswitchApp')
    .component('bibDescription', {
      templateUrl: 'app/bibliotheque/bib-description/bib-description.html',
      bindings: {
        op: '<',
        eff: '<'
      },
      controller: BibDescription,
    });

})();