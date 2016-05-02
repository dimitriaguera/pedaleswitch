'use strict';
(function(){


  class ComposantComponent {

  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    this.composants = [];
    this.obj = [];

    this.composantTypes = [];

    this.newComposant = {
      titre: '',
      type: '',
      description: '',
      disponible: true,
      prix_additionnel: '',
      dimensions: {x:'',y:''},
      media: []
    };

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('composant');
    });
  }


  $onInit() {
    this.$http.get('/api/composants').then(response => {
      this.composants = response.data;
      this.socket.syncUpdates('composant', this.composants);
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
        dimensions: {x:this.newComposant.x,y:this.newComposant.y},
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
      dimensions: {x:'',y:''},
      media: []
    };
  }

  deleteComposant(composant) {
    this.$http.delete('/api/composants/' + composant._id);
  }

  randJson(){
    this.$http.get('/api/dummyjsons/composant').then(response => {
      this.json = response.data;
    });
  }

}

angular.module('pedaleswitchApp')
  .component('composant', {
    templateUrl: 'app/composant/composant.html',
    controller: ComposantComponent
  });

})();
