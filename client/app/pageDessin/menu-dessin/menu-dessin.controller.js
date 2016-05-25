'use strict';
(function(){

  class MenuDessin {
    constructor() {

    }
    $onInit(){
      this.isActive = 'effet';
      this.debrayable = false;
    }

    switchDebChild(){
      if (!this.debrayable){
        this.isActive = 'effet';
      }
      this.switchDeb({value: this.debrayable});
    }
  }

  angular.module('pedaleswitchApp')
    .component('menuDessin', {
      templateUrl: 'app/pageDessin/menu-dessin/menu-dessin.html',
      bindings: {
        switchDeb: '&',
        activeEffet: '&',
        activeCompo: '&'
      },
      controller: MenuDessin,
    });

})();