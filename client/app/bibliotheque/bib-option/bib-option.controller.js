'use strict';
(function(){

  class BibOption {
    constructor() {
    }
  }

  angular.module('pedaleswitchApp')
    .component('bibOption', {
      templateUrl: 'app/bibliotheque/bib-option/bib-option.html',
      bindings: {
        options: '<',
        selectoption: '='
      },
      controller: BibOption
    });

})();