'use strict';
(function(){

class EffetComponent {
  constructor($http, $scope, $stateParams, dataPrepar, $state, socket) {
    this.$http = $http;
    this.$state = $state;
    this.dataPrepar = dataPrepar,
    this.socket = socket;
    this.indexEffets = [];
    this.message = $stateParams.message || [];
    //$scope.$on('$destroy', function() {
    //  socket.unsyncUpdates('effet');
    //});
  }
  $onInit(){
    this.$http.get('/api/effets').then(response => {
      this.indexEffets = response.data;
    //  this.socket.syncUpdates('effet', this.indexEffets);
    });
  }

  deleteEffet(effet, message) {

    var $this = this;
    var mess = message || {
          ok: 'ok',
          error: 'error'
        };

    if(effet._id) {
      this.$http.delete('/api/effets/' + effet._id).then(function successCallback(response) {
        // Si succes de la requete.
        $this.message.push({
          body: mess.ok,
          type: 'success'
        });
      }, function errorCallback(response) {
        // Si requete rejetée.
        $this.message.push({
          type: 'danger',
          body: mess.error + angular.toJson(response.data)
        });
      });
    }
  }

  deleteSelectEffets() {

    var l = this.indexEffets.length;

    for ( var i = 0; i < l; i++ ) {

      var effet = this.indexEffets[i];

      var message = {
        ok: 'L\'effet '+ effet.titre +' a été supprimé.',
        error: 'Probleme lors de la suppression de l\'effet ' + effet.titre + '.'
      };

      if (effet.isSelected && effet.isSelected == true) {
        this.deleteEffet(effet, message);
      }
    }
  }

  updateEffet(effet, message){

    var $this = this,
        data = this.dataPrepar.getDataEffet(effet);

    if(effet._id) {
      this.$http.put('/api/effets/' + data._id, data).then(function successCallback(response) {
        // Si succes de la requete.
        $this.message.push({
          body: message.ok,
          type: 'success'
        });
      }, function errorCallback(response) {
        // Si requete rejetée.
        $this.message.push({
          type: 'danger',
          body: message.error + angular.toJson(response.data)
        });
      });
    }
  }

  updateOptionPublie(effet, index, bool) {

    effet.options[index].publie = bool;

    var message = {
      ok: 'Modification du statut de publication de l\'option "' + effet.options[index].titre + '". ',
      error: 'Erreur lors de la publication de l\'option "' + effet.options[index].titre + '". '
    };

    this.updateEffet(effet, message);
  }

  deleteOption(effet, index) {

    var message = {
      ok: 'L\'option "' + effet.options[index].titre + '" a bien été supprimée.',
      error: 'Erreur lors de la modification du statut de publication de l\'option "' + effet.options[index].titre + '". '
    };

    effet.options.splice(index, 1);

    //Si dernière option, on supprime l'effet.
    if (effet.options.length === 0) {
      this.deleteEffet(effet, message);
    }
    //Sinon on met l'effet à jour.
    else {
      this.updateEffet(effet, message);
    }
  }
  closeAlert(index) {
    this.message.splice(index, 1);
  }
}

angular.module('pedaleswitchApp')
  .component('effet', {
    templateUrl: 'app/effet/effet/effet.html',
    controller: EffetComponent
  });

})();
