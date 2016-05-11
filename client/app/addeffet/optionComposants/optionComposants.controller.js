'use strict';
(function(){

class OptionsComposants {
  constructor($http) {
    this.$http = $http;
    this.typeCompo = {};
  }

  $onInit(){
    if(this.nouvoption){
      this.oneOption.composants = [{titre:"A définir"}];
    }
    this.$http.get('/api/composantTypes').then(response => {
      this.typeCompo = response.data;
    });
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
