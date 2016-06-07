'use strict';
(function(){

  class BibCompoDesc {
    constructor(instanceDessin) {
      this.instanceDessin = instanceDessin;
    }
    addEffet(){
      this.instanceDessin.setEffet(this.eff, this.op);
    }
  }

  angular.module('pedaleswitchApp')
    .component('bibCompoDesc', {
      templateUrl: 'app/bibliotheque-compo/bib-compo-desc/bib-compo-desc.html',
      bindings: {
        items: '<',
        op: '<',
        eff: '<'
      },
      controller: BibCompoDesc
    });

})();