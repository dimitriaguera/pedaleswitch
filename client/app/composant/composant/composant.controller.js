'use strict';
(function(){

class ComposantComponent {

  constructor($http, $scope, $stateParams, dataPrepar, $state, socket) {
    this.$http = $http;
    this.$state = $state;
    this.dataPrepar = dataPrepar,
    this.socket = socket;
    this.composants = [];
    this.message = $stateParams.message || [];
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('composant');
    });
  }
  $onInit(){
    this.$http.get('/api/composants').then(response => {
      this.composants = response.data;
      this.socket.syncUpdates('composant', this.composants);
    });
  }

  deleteSelectComposants() {

    var l = this.composants.length;

    for ( var i = 0; i < l; i++ ) {

      var composant = this.composants[i];

      var message = {
        ok: 'Le composant '+ composant.titre +' a été supprimé.',
        error: 'Probleme lors de la suppression du composant ' + composant.titre + '.'
      };

      if (composant.isSelected && composant.isSelected == true) {
        this.deleteComposant(composant, message);
      }
    }
  }

  updateComposant(composant, message){

    var $this = this,
        data = this.dataPrepar.getDataComposant(composant);

    if(composant._id) {
      this.$http.put('/api/composants/' + data._id, data).then(function successCallback(response) {
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

  updateComposantPublie(composant, bool) {

    composant.publie = bool;

    var message = {
      ok: 'Modification du statut de publication du composant "' + composant.titre + '". ',
      error: 'Erreur lors de la publication du composant "' + composant.titre + '". '
    };

    this.updateComposant(composant, message);
  }

  deleteComposant(composant) {

    var message = {};
    var $this = this;

    this.$http.delete('/api/composants/' + composant._id).then(function successCallback(response) {
      // Si succes de la requete.
      message.body = 'Le composant' + composant.titre + ' a été supprimé.';
      message.type = 'success';
      $this.message.push(message);

    }, function errorCallback(response) {
      // Si requete rejetée.
      message.body = 'Probleme lors de la suppression du composant' + composant.titre + angular.toJson(response.data);
      message.type = 'danger';
      $this.message.push(message);
    });
  }
  closeAlert(index) {
    this.message.splice(index, 1);
  }

  //constructor($http, $scope, $state, socket, Auth, OrderArray) {
  //  this.$http = $http;
  //  this.$state = $state;
  //  this.socket = socket;
  //  this.message = [];
  //
  //  this.composants = {};
  //  this.composantTypes = [];
  //  this.newComposant = {
  //    titre: '',
  //    type: '',
  //    shape: '',
  //    description: '',
  //    disponible: true,
  //    prix_additionnel: '',
  //    size: {w: '', h: ''},
  //    media: []
  //  };
  //
  //
  //  // @todo Authentification pour ne pas afficher des boutons.
  //  // Surement a supprimer d'ici
  //  this.isLoggedIn = Auth.isLoggedIn;
  //  this.isAdmin = Auth.isAdmin;
  //  this.getCurrentUser = Auth.getCurrentUser;
  //
  //  // Pager.
  //  this.nbItems = 0;
  //  this.currentPage = 1;
  //  this.itemsPerPage = 10;
  //
  //  //loading
  //  this.loading = true;
  //
  //  //Trie
  //  this.OrderArray = OrderArray;
  //
  //  $scope.$on('$destroy', function () {
  //    socket.unsyncUpdates('composant');
  //  });
  //}
  //
  //
  //$onInit() {
  //  this.loading = true;
  //  this.$http.get('/api/composants').then(response => {
  //  //  this.composants = this.OrderArray.order(response.data, 'type');
  //  this.composants = response.data;
  //  this.nbItems = this.composants.length;
  //  this.socket.syncUpdates('composant', this.composants);
  //  this.loading = false;
  //});
  //}
  //
  //
  //addComposant() {
  //
  //  var message = {};
  //  var $this = this;
  //
  //  if (this.newComposant) {
  //    this.$http.post('/api/composants',
  //        {
  //          titre: this.newComposant.titre,
  //          type: this.newComposant.type,
  //          shape: this.newComposant.shape,
  //          description: this.newComposant.description,
  //          disponible: this.newComposant.disponible,
  //          prix_additionnel: this.newComposant.prix_additionnel,
  //          size: {w: this.newComposant.size.w, h: this.newComposant.size.h},
  //          media: []
  //        });
  //  }
  //
  //  // On redefinie tout l'objet sinon le booleean disponible n'a pa de valeur.
  //  this.newComposant = {
  //    titre: '',
  //    type: '',
  //    shape: '',
  //    description: '',
  //    disponible: true,
  //    prix_additionnel: '',
  //    size: {w: '', h: ''},
  //    media: []
  //  };
  //}
  //
  //deleteComposant(composant) {
  //
  //  var message = {};
  //  var $this = this;
  //
  //  this.$http.delete('/api/composants/' + composant._id).then(function successCallback(response) {
  //    // Si succes de la requete.
  //    message.body = 'Le composant' + composant.titre + ' a été supprimé.';
  //    message.type = 'success';
  //    $this.message.push(message);
  //
  //  }, function errorCallback(response) {
  //    // Si requete rejetée.
  //    message.body = 'Probleme lors de la suppression du composant' + composant.titre + angular.toJson(response.data);
  //    message.type = 'danger';
  //    $this.message.push(message);
  //  });
  //}

}

angular.module('pedaleswitchApp')
  .component('composant', {
    templateUrl: 'app/composant/composant/composant.html',
    controller: ComposantComponent
  });

})();
