'use strict';
(function(){

class EditEffetComponent {
  constructor($stateParams, $http) {
    this.$http = $http;
    this.entity = $stateParams.entity || {};
    this.types = $stateParams.types || {};
    this.nouv = $stateParams.nouv;
  }
  addEffet() {
    if (this.entity.titre) {
      var data = {
        titre: this.entity.titre,
        description: this.entity.description,
        type: this.entity.type,
        options: this.entity.options,
      }
      this.$http.post('/api/effets', data);
      this.entity.titre = '';
      this.entity.description = '';
      this.entity.type = '';
    }
  }
  updateEffet(effet) {
    if(effet._id) {
      this.$http.put('/api/effets/' + effet._id, effet);
    }
  }
  deleteEffet(effet) {
    if(effet._id) {
      this.$http.delete('/api/effets/' + effet._id);
      this.entity = {};
      this.nouv = true;
    }
  }
  onAction(nouv){
    if(nouv){
      this.addEffet();
      return;
    }
    this.updateEffet(this.entity);
  }
}

angular.module('pedaleswitchApp')
  .component('editeffet', {
    templateUrl: 'app/addeffet/editeffet/editeffet.html',
    controller: EditEffetComponent,
  });

})();
