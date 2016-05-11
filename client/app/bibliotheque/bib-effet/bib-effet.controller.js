'use strict';
(function(){

  class BibEffet {
    constructor() {
    }
  }

  angular.module('pedaleswitchApp')
    .component('bibEffet', {
      templateUrl: 'app/bibliotheque/bib-effet/bib-effet.html',
      bindings: {
        effets: '<',
        selecteffet: '<',
        chgmteffet: '&'
      },
      controller: BibEffet,
    });

})();