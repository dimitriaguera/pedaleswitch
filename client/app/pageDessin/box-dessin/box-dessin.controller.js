'use strict';
(function(){

  class BoxDessin {
    constructor() {

    }
    $onInit(){

    }
  }

  angular.module('pedaleswitchApp')
    .component('boxDessin', {
      templateUrl: 'app/pageDessin/box-dessin/box-dessin.html',
      bindings: {
        tableData: '<'
      },
      controller: BoxDessin,
    });

})();