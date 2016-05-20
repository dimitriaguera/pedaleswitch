'use strict';
(function(){

  class BibDescription {
    constructor(instanceDessin) {
      this.instanceDessin = instanceDessin;
    }
    addEffet(){
      this.instanceDessin.setEffet(this.eff, this.op);
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