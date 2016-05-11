'use strict';
(function(){

class BibliothequeComponent {
  constructor($http, OrderArray) {
    this.$http = $http;
    this.effets = [];
    this.selecteffet = {};
    this.selectoption = {};
    this.OrderArray = OrderArray;
  }
  $onInit(){
    this.$http.get('/api/effets').then(response => {
      this.effets = this.OrderArray.order(response.data);
  });
  }

  chgmtEffet(eff){
    this.selecteffet = eff;
    this.selectoption = eff.options[0];
  }
}

angular.module('pedaleswitchApp')
  .component('bibliotheque', {
    templateUrl: 'app/bibliotheque/bibliotheque.html',
    controller: BibliothequeComponent
  });

})();
