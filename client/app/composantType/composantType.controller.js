'use strict';
(function(){

class ComposantTypeComponent {
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('composantType');
    });
  }

  $onInit() {
    this.$http.get('/api/composantTypes').then(response => {
      this.composantTypes = response.data;
      this.socket.syncUpdates('composantType', this.composantTypes);
    });
  }


  addComposantType() {
    if (this.newComposantType.titre) {
      this.$http.post('/api/composantTypes',
        {
          titre: this.newComposantType.titre
        });
    }
    this.newComposantType = '';
  }

  deleteComposantType(composantType) {
    this.$http.delete('/api/composantTypes/' + composantType._id);
  }

  updateComposantType(composantType){
    this.$http.put('/api/composantTypes/' + composantType._id, composantType);
  }

}


angular.module('pedaleswitchApp')
  .component('composantType', {
    templateUrl: 'app/composantType/composantType.html',
    controller: ComposantTypeComponent,
    require: {
      ctrlCompo: '^composant'
    }
  });

})();
