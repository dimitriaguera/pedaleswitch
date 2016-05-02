'use strict';
(function(){

  class AddtypeComponent {
    constructor($http, $scope, socket) {
      this.message = 'Hello';
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
      if (this.newTypeEffet.name) {
        this.$http.post('/api/typeEffets', { name: this.newTypeEffet.name });
        this.newTypeEffet.name = '';
      }
    }
    deleteTypeEffet(effet) {
      this.$http.delete('/api/typeEffets/' + effet._id);
    }
    updateEffet(effet, value) {
      this.$http.put('/api/typeEffets/' + effet._id, { name: value });
    }
  }

  angular.module('pedaleswitchApp')
    .component('addtype', {
      templateUrl: 'app/addeffet/type/addtype.html',
      //require: {
      //  ctrlEffet: '^addeffet',
      //},
      bindings: {
        types: '=',
      },
      controller: AddtypeComponent,
    });

})();