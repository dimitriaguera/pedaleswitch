'use strict';
(function(){

  class AddtypeComponent {
    constructor($http, $scope, socket) {
      this.$http = $http;
      this.socket = socket;
      this.message = [];
      this.modalText = {
        message: 'Supprimer',
        body: 'Attention action definitive'
      };
      $scope.$on('$destroy', function() {
        socket.unsyncUpdates('typeEffet');
      });
    }
    $onInit(){
      this.$http.get('/api/typeEffets').then(response => {
        this.types = response.data;
      this.socket.syncUpdates('typeEffet', this.types);
    });
    }
    addTypeEffet() {
      var $this = this;
      var message = {};
      if (this.newTypeEffet) {
        this.$http.post('/api/typeEffets', { titre: this.newTypeEffet.titre }).then(function successCallback(response) {

          // Si succes de la requete.
          message.body = 'Le type d\'effet "' + $this.newTypeEffet.titre + '" a été ajouté.';
          message.type = 'success';
          $this.message.push(message);
          $this.newTypeEffet.titre = '';

        }, function errorCallback(response) {
          // Si requete rejetée.
          message.type = 'danger';
          message.body = 'ERREUR' + response.status + ' - '  + response.statusText +
              ' Problème lors de l\'enregistrement en base de donnée. Le type d\'effet "' + $this.newTypeEffet.titre + '" n\' a pas été ajouté. ' +
              angular.toJson(response.data);
          $this.message.push(message);
        });
      }
    }
    deleteTypeEffet(effet) {
      var $this = this;
      var message = {};
      this.$http.delete('/api/typeEffets/' + effet._id).then(function successCallback(response) {

        // Si succes de la requete.
        message.body = 'Le type d\'effet "' + effet.titre + '" a été supprimé.';
        message.type = 'success';
        $this.message.push(message);

      }, function errorCallback(response) {
        // Si requete rejetée.
        message.type = 'danger';
        message.body = 'ERREUR' + response.status + ' - '  + response.statusText +
            ' Problème lors de la suppression. Le type d\'effet "' + effet.titre + '" n\' a pas été supprimé. ' +
            angular.toJson(response.data);
        $this.message.push(message);
      });
    }
    updateTypeEffet(effet, value) {
      var $this = this;
      var message = {};
      if (effet.titre !== value) {
        this.$http.put('/api/typeEffets/' + effet._id, {titre: value}).then(function successCallback(response) {

          // Si succes de la requete.
          message.body = 'Le type d\'effet "' + value + '" a été mis à jour.';
          message.type = 'success';
          $this.message.push(message);

        }, function errorCallback(response) {
          // Si requete rejetée.
          message.type = 'danger';
          message.body = 'ERREUR' + response.status + ' - ' + response.statusText +
              ' Problème lors de la mise à jour. Le type d\'effet "' + effet.titre + '" n\' a pas été modifié. ' +
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
    .component('addtype', {
      templateUrl: 'app/effet/type/addtype.html',
      controller: AddtypeComponent,
    });

})();