'use strict';
(function(){

  class BibEffet {
    constructor() {
      this.selecteffet = {};
    }
  }

  angular.module('pedaleswitchApp')
    .component('bibEffet', {
      templateUrl: 'app/bibliotheque/bib-effet/bib-effet.html',
      bindings: {
        effets: '<',
        chgmteffet: '&'
      },
      controller: BibEffet,
    });

})();