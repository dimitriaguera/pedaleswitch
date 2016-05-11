'use strict';
(function(){

class ListeComposants {
  constructor($http, OrderArray) {
    this.message = 'Hello';
    this.$http = $http;
    this.listeCompo = [];
    this.selectCompo = [];
    this.OrderArray = OrderArray;
  }

  $onInit(){
    this.$http.get('/api/composants').then(response => {
      this.listeCompo = this.OrderArray.order(response.data, 'type');
      if(this.saved){
        for (var p in this.listeCompo) {
          if (this.listeCompo.hasOwnProperty(p)) {
            for (var j=0; j<this.listeCompo[p].length; j++) {
              if (this.saved.indexOf(this.listeCompo[p][j]._id) >= 0) {
                this.listeCompo[p][j].value = true;
              }
            }
          }
        }
      }
    });
  }

  //Object.keys(this.listeCompo).forEach(function(){});
  validation() {
    for (var p in this.listeCompo) {
      if (this.listeCompo.hasOwnProperty(p)) {
        for (var j=0; j<this.listeCompo[p].length; j++) {
          if (this.listeCompo[p][j].value === true) {
            this.selectCompo.push(this.listeCompo[p][j]._id)
          }
        }
      }
    }
    this.ok({selected:this.selectCompo});
  }
  //validation(){
  //  for(var i=0; i<this.listeCompo.length; i++) {
  //    for (var j=0; j<this.listeCompo[i].length; j++) {
  //      if (this.listeCompo[i][j].value === true) {
  //        this.selectCompo.push(this.listeCompo[i][j]._id)
  //      }
  //    }
  //  }
  //  alert(this.selectCompo.toString());
  //  this.ok({selected:this.selectCompo});
  //}

  annuler(){
    this.cancel();
  }
}

angular.module('pedaleswitchApp')
  .component('listeComposants', {
    templateUrl: 'app/addeffet/listeComposants/listeComposants.html',
    controller: ListeComposants,
    bindings:{
      ok: '&',
      cancel: '&',
      saved: '<'
    }
  });

})();
