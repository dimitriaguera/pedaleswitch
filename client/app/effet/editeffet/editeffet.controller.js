'use strict';
(function(){

class EditEffetComponent {
  constructor($stateParams, $http, $scope, $state, dataPrepar) {
    this.$http = $http;
    this.$state = $state;
    this.$scope = $scope;
    this.dataPrepar = dataPrepar;
    this.entity = $stateParams.entity || {
          options:[{
            disponibilite:'enStock',
            publie: false,
            composants: [{
              titre:'A définir'
            }]
          }]};
    this.types = false;
    this.nouveau = true;
    this.message = [];
  }

  $onInit(){
    // Chargement des types d'effet.
    if (!this.type) {
      this.$http.get('/api/typeEffets').then(response => {
        this.types = response.data;
      });
    }
    // On determine si l'effet est deja en bdd.
    if (this.entity._id) {
      this.nouveau = false;
    }
  }

  addEffet() {

    // On emet un broadcast attrapé par showErrors.
    // Cela permet d'appliquer l'etat d'erreur aux champs erronnés.
    this.$scope.$broadcast('show-errors-check-validity');

    // Si une erreur est detectée dans le formulaire, on stoppe l'envoie au serveur.
    if (this.$scope.effetForm.$invalid) {
      alert('pas de valid form');
      return; }

    // Si l'effet n'est pas nouveau, on update.
    if (!this.nouveau) {
      this.updateEffet(this.entity);
      return;
    }

    // Preparation des données à mettre en DB.
    var data = this.dataPrepar.getDataEffet(this.entity);
    var $this = this;
    var message = {};

    // Envoie de l'effet à l'api serveur pour enregistrement en base de donnée.
    this.$http.post('/api/effets', data).then(function successCallback(response) {

      // Si succes de la requete.
      message.body = 'L\'effet ' + data.titre + 'a bien été enregistré.';
      message.type = 'success';
      $this.message.push(message);
      $this.$state.go('effets', {message: $this.message});

    }, function errorCallback(response) {
      // Si requete rejetée.
      message.type = 'danger';
      message.body = 'ERREUR ' + response.status + ' - ' + response.statusText +
          ' Problème lors de l\'enregistrement en base de donnée. L\'effet "' + data.titre + '" n\' a pas été enregistré. ' +
          angular.toJson(response.data);
      $this.message.push(message);
    });
  }

  updateEffet(effet) {
    if(effet._id) {

      // Preparation des données à mettre en DB.
      var data = this.dataPrepar.getDataEffet(this.entity);
      var $this = this;
      var message = {};

      this.$http.put('/api/effets/' + data._id, data).then(function successCallback(response) {

        // Si succes de la requete.
        message.body = 'L\'effet ' + data.titre + ' a été mis à jour.';
        message.type = 'success';
        $this.message.push(message);
        $this.$state.go('effets', {message: $this.message});

      }, function errorCallback(response) {
        // Si requete rejetée.
        message.type = 'danger';
        message.body = 'ERREUR' + response.status + ' - '  + response.statusText +
            ' Problème lors de l\'enregistrement en base de donnée. L\'effet "' + data.titre + '" n\' a pas été mis à jour. ' +
            angular.toJson(response.data);
        $this.message.push(message);
      });
    }
  }
  deleteEffet(effet) {
    if(effet._id) {
      var $this = this;
      var message = {};
      this.$http.delete('/api/effets/' + effet._id).then(function successCallback(response) {

        // Si succes de la requete.
        message.body = 'L\'effet ' + effet.titre + ' a été supprimé.';
        message.type = 'succes';
        $this.message.push(message);
        $this.$state.go('effets', {message: $this.message});

      }, function errorCallback(response) {
        // Si requete rejetée.
        message.type = 'danger';
        message.body = 'ERREUR' + response.status + ' - '  + response.statusText +
            ' Problème lors de la suppression de l\'effet "' + effet.titre + '". ' +
            angular.toJson(response.data);
        $this.message.push(message);
      });
    }
  }
  closeAlert(index) {
    this.message.splice(index, 1);
  }
}

angular.module('pedaleswitchApp')
  .component('editeffet', {
    templateUrl: 'app/effet/editeffet/editeffet.html',
    controller: EditEffetComponent,
  });

})();
