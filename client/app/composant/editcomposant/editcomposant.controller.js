'use strict';
(function(){

class EditComposantComponent {
  constructor($stateParams, $http, $scope, $state, dataPrepar) {
    this.$http = $http;
    this.$state = $state;
    this.$scope = $scope;
    this.dataPrepar = dataPrepar;
    this.entity = $stateParams.entity || {
          disponibilite:'enStock',
          publie: false,
          shape: 'Rect',
        };
    this.types = false;
    this.nouveau = true;
    this.message = [];
  }

  $onInit(){
    // Chargement des types d'effet.
    if (!this.types) {
      this.$http.get('/api/composantTypes').then(response => {
        this.types = response.data;
      });
    }
    // On determine si le composant est deja en bdd.
    if (this.entity._id) {
      this.nouveau = false;
    }
  }

  addComposant() {

    // On emet un broadcast attrapé par showErrors.
    // Cela permet d'appliquer l'etat d'erreur aux champs erronnés.
    this.$scope.$broadcast('show-errors-check-validity');

    // Si une erreur est detectée dans le formulaire, on stoppe l'envoie au serveur.
    if (this.$scope.composantForm.$invalid) {
      var message = {};
      message.body = 'Tous les champs du formulaire n\'ont pas été correctement remplis. Veuillez vérifier votre saisie avant de valider à nouveau.';
      message.type = 'danger';
      this.message.push(message);
      return; }

    // Si le composant n'est pas nouveau, on update.
    if (!this.nouveau) {
      this.updateComposant(this.entity);
      return;
    }

    // Preparation des données à mettre en DB.
    var data = this.dataPrepar.getDataComposant(this.entity);
    var $this = this;
    var message = {};

    // Envoie de l'effet à l'api serveur pour enregistrement en base de donnée.
    this.$http.post('/api/composants', data).then(function successCallback(response) {

      // Si succes de la requete.
      message.body = 'Le composant ' + data.titre + 'a bien été enregistré.';
      message.type = 'success';
      $this.message.push(message);
      $this.$state.go('composants', {message: $this.message});

    }, function errorCallback(response) {
      // Si requete rejetée.
      message.type = 'danger';
      message.body = 'ERREUR ' + response.status + ' - ' + response.statusText +
          ' Problème lors de l\'enregistrement en base de donnée. Le composant "' + data.titre + '" n\' a pas été enregistré. ' +
          angular.toJson(response.data);
      $this.message.push(message);
    });
  }

  updateComposant(composant) {
    if(composant._id) {

      // Preparation des données à mettre en DB.
      var data = this.dataPrepar.getDataComposant(this.entity);
      var $this = this;
      var message = {};

      this.$http.put('/api/composants/' + data._id, data).then(function successCallback(response) {

        // Si succes de la requete.
        message.body = 'Le composant ' + data.titre + ' a été mis à jour.';
        message.type = 'success';
        $this.message.push(message);
        $this.$state.go('composants', {message: $this.message});

      }, function errorCallback(response) {
        // Si requete rejetée.
        message.type = 'danger';
        message.body = 'ERREUR' + response.status + ' - '  + response.statusText +
            ' Problème lors de l\'enregistrement en base de donnée. Le composant "' + data.titre + '" n\' a pas été mis à jour. ' +
            angular.toJson(response.data);
        $this.message.push(message);
      });
    }
  }
  deleteComposant(composant) {
    if(composant._id) {
      var $this = this;
      var message = {};
      this.$http.delete('/api/composants/' + composant._id).then(function successCallback(response) {

        // Si succes de la requete.
        message.body = 'Le composant ' + composant.titre + ' a été supprimé.';
        message.type = 'succes';
        $this.message.push(message);
        $this.$state.go('composants', {message: $this.message});

      }, function errorCallback(response) {
        // Si requete rejetée.
        message.type = 'danger';
        message.body = 'ERREUR' + response.status + ' - '  + response.statusText +
            ' Problème lors de la suppression du composant "' + composant.titre + '". ' +
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
  .component('editcomposant', {
    templateUrl: 'app/composant/editcomposant/editcomposant.html',
    controller: EditComposantComponent,
  });

})();
