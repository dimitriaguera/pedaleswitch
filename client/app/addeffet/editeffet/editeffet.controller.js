'use strict';
(function(){

class EditEffetComponent {
  constructor($stateParams, $http, $scope) {
    this.$http = $http;
    this.$scope = $scope;
    this.entity = $stateParams.entity || {};
    this.types = $stateParams.types || {};
    this.nouv = $stateParams.nouv;
  }

  addEffet() {

    // On emet un broadcast attrapé par showErrors.
    // Cela permet d'appliquer l'etat d'erreur aux champs erronnés.
    this.$scope.$broadcast('show-errors-check-validity');

    // Si une erreur est detectée dans le formulaire, on stoppe l'envoie au serveur.
    if (this.$scope.effetForm.$invalid) {
      return; }

    // Validation côté client effectuée. On construit l'objet à envoyer au serveur.
    var data = {
      titre: this.entity.titre,
      description: this.entity.description,
      type: this.entity.type,
      options:[],
    };

    for(var i=0; i<this.entity.options.length; i++){
      data.options.push(this.entity.options[i]);
    }

    // Envoie de l'effet à l'api serveur pour enregistrement en base de donnée.
    this.$http.post('/api/effets', data).then(function successCallback(response) {
      // Si succes de la requete.
    }, function errorCallback(response) {
      // Si requete rejetée.
    });

    // RAZ des champs.
    this.entity.titre = '';
    this.entity.description = '';
    this.entity.type = '';
    this.entity.options = [];
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
