'use strict';
(function () {


  class ComposantComponent {

    constructor($http, $scope, socket, Auth, OrderArray) {
      this.$http = $http;
      this.socket = socket;


      this.composants = {};
      this.composantTypes = [];
      this.newComposant = {
        titre: '',
        type: '',
        description: '',
        disponible: true,
        prix_additionnel: '',
        dimensions: {w: '', h: ''},
        media: []
      };


      // @todo Authentification pour ne pas afficher des boutons.
      // Surement a supprimer d'ici
      this.isLoggedIn = Auth.isLoggedIn;
      this.isAdmin = Auth.isAdmin;
      this.getCurrentUser = Auth.getCurrentUser;

      // Pager.
      this.nbItems = 0;
      this.currentPage = 1;
      this.itemsPerPage = 10;

      //loading
      this.loading = true;

      //Trie
      this.OrderArray = OrderArray;
      
      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('composant');
      });
    }


    $onInit() {
      this.loading = true;
      this.$http.get('/api/composants').then(response => {
        this.composants = this.OrderArray.order(response.data, 'type');
        this.nbItems = this.composants.length;
        this.socket.syncUpdates('composant', this.composants);
        this.loading = false;
      });
    }


    addComposant() {
      if (this.newComposant) {
        this.$http.post('/api/composants',
          {
            titre: this.newComposant.titre,
            type: this.newComposant.type,
            description: this.newComposant.description,
            disponible: this.newComposant.disponible,
            prix_additionnel: this.newComposant.prix_additionnel,
            dimensions: {w: this.newComposant.w, w: this.newComposant.h},
            media: []
          });
      }

      // On redefinie tout l'objet sinon le booleean disponible n'a pa de valeur.
      this.newComposant = {
        titre: '',
        type: '',
        description: '',
        disponible: true,
        prix_additionnel: '',
        dimensions: {w: '', h: ''},
        media: []
      };
    }

    deleteComposant(composant) {
      this.$http.delete('/api/composants/' + composant._id);
    }
    


  }

  angular.module('pedaleswitchApp')
    .component('composant', {
      templateUrl: 'app/composant/composant.html',
      controller: ComposantComponent
    });

})();
