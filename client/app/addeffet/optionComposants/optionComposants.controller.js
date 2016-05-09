'use strict';
(function(){

class OptionsComposants {
  constructor() {
    this.message = 'Hello';
  }
  $onInit(){
    if(this.nouvoption){
      this.oneOption.composants = [{titre:"A définir"}];
    }
  }
  newComposant(){
    this.oneOption.composants.push({titre:"nouveau composant"});
  }
  deleteComposant(index){
    this.oneOption.composants.splice(index, 1);
  }
}

angular.module('pedaleswitchApp')
  .component('optionComposants', {
    templateUrl: 'app/addeffet/optionComposants/optionComposants.html',
    controller: OptionsComposants,
    bindings: {
      oneOption: '=',
      nouvoption: '<',
    },
  });

})();
