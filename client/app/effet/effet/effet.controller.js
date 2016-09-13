'use strict';
(function(){

class EffetComponent {
  constructor($http, $scope, $state, socket) {
    this.$http = $http;
    this.$state = $state;
    this.socket = socket;
    this.indexEffets = [];
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

  deleteEffet(effet) {
    if(effet._id) {
      this.$http.delete('/api/effets/' + effet._id);
    }
  }

  deleteOption(effet, index) {
    effet.options.splice(index, 1);
  }

  updateOptionPublie(effet, index, bool) {
    if(effet._id) {
      effet.options[index].publie = bool;
      this.$http.put('/api/effets/' + effet._id, effet);
    }
  }
}

angular.module('pedaleswitchApp')
  .component('effet', {
    templateUrl: 'app/effet/effet/effet.html',
    bindings: {
      types: '=',
    },
    controller: EffetComponent,
  });

})();
