'use strict';
(function(){

  class AddtypeComponent {
    constructor($http, $scope, socket) {
      this.$http = $http;
      this.socket = socket;
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
      if (this.newTypeEffet.titre) {
        this.$http.post('/api/typeEffets', { titre: this.newTypeEffet.titre });
        this.newTypeEffet.titre = '';
      }
    }
    deleteTypeEffet(effet) {
      this.$http.delete('/api/typeEffets/' + effet._id);
    }
    updateTypeEffet(effet, value) {
      this.$http.put('/api/typeEffets/' + effet._id, { titre: value });
    }
  }

  angular.module('pedaleswitchApp')
    .component('addtype', {
      templateUrl: 'app/effet/type/addtype.html',
      controller: AddtypeComponent,
    });

})();