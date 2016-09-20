'use strict';
(function(){

  class AddtypecompoComponent {
    constructor($http, $scope, socket) {
      this.$http = $http;
      this.socket = socket;
      this.message = [];
      this.modalText = {
        message: 'Supprimer',
        body: 'Attention action definitive'
      };
      $scope.$on('$destroy', function() {
        socket.unsyncUpdates('composantType');
      });
    }
    $onInit(){
      this.$http.get('/api/composantTypes').then(response => {
        this.types = response.data;
      this.socket.syncUpdates('composantType', this.types);
    });
    }
    addTypeComposant() {
      var $this = this;
      var message = {};
      if (this.newTypeComposant) {
        this.$http.post('/api/composantTypes', { titre: this.newTypeComposant.titre }).then(function successCallback(response) {

          // Si succes de la requete.
          message.body = 'Le type de composant "' + $this.newTypeComposant.titre + '" a été ajouté.';
          message.type = 'success';
          $this.message.push(message);
          $this.newTypeComposant.titre = '';

        }, function errorCallback(response) {
          // Si requete rejetée.
          message.type = 'danger';
          message.body = 'ERREUR' + response.status + ' - '  + response.statusText +
              ' Problème lors de l\'enregistrement en base de donnée. Le type de composant "' + $this.newTypeComposant.titre + '" n\' a pas été ajouté. ' +
              angular.toJson(response.data);
          $this.message.push(message);
        });
      }
    }
    deleteTypeComposant(composant) {
      var $this = this;
      var message = {};
      this.$http.delete('/api/composantTypes/' + composant._id).then(function successCallback(response) {

        // Si succes de la requete.
        message.body = 'Le type de composant "' + composant.titre + '" a été supprimé.';
        message.type = 'success';
        $this.message.push(message);

      }, function errorCallback(response) {
        // Si requete rejetée.
        message.type = 'danger';
        message.body = 'ERREUR' + response.status + ' - '  + response.statusText +
            ' Problème lors de la suppression. Le type de composant "' + composant.titre + '" n\' a pas été supprimé. ' +
            angular.toJson(response.data);
        $this.message.push(message);
      });
    }
    updateTypeComposant(composant, value) {
      var $this = this;
      var message = {};
      if (composant.titre !== value) {
        this.$http.put('/api/composantTypes/' + composant._id, {titre: value}).then(function successCallback(response) {

          // Si succes de la requete.
          message.body = 'Le type de composant "' + value + '" a été mis à jour.';
          message.type = 'success';
          $this.message.push(message);

        }, function errorCallback(response) {
          // Si requete rejetée.
          message.type = 'danger';
          message.body = 'ERREUR' + response.status + ' - ' + response.statusText +
              ' Problème lors de la mise à jour. Le type de composant "' + composant.titre + '" n\' a pas été modifié. ' +
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
    .component('addtypecompo', {
      templateUrl: 'app/composant/typeCompo/addtypecompo.html',
      controller: AddtypecompoComponent,
    });

})();