'use strict';
(function(){

  class BibCompoItem {
    constructor() {

    }
  }

  angular.module('pedaleswitchApp')
    .component('bibCompoItem', {
      templateUrl: 'app/bibliotheque-compo/bib-compo-item/bib-compo-item.html',
      bindings: {
        options: '<',
        items: '<',
        selectoption: '='
      },
      controller: BibCompoItem
    });

})();