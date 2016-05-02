'use strict';
(function(){

class EffetComponent {
  constructor($http, $scope, socket) {
    this.message = 'Hello';
    this.$http = $http;
    this.socket = socket;
    this.indexEffets = [];
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('effet');
    });
  }
  $onInit(){
      this.$http.get('/api/effets').then(response => {
      this.indexEffets = response.data;
      this.socket.syncUpdates('effet', this.indexEffets);
    });
  }
  addEffet() {
    if (this.newEffet.name) {
      var data = {
        name: this.newEffet.name,
        info: this.newEffet.info,
        type: this.newEffet.type,
      }
      this.$http.post('/api/effets', data);
      this.newEffet.name = '';
      this.newEffet.info = '';
      this.newEffet.type = '';
    }
  }
  deleteEffet(effet) {
    this.$http.delete('/api/effets/' + effet._id);
  }
}

angular.module('pedaleswitchApp')
  .component('effet', {
    templateUrl: 'app/addeffet/effet/effet.html',
    bindings: {
      types: '=',
    },
    controller: EffetComponent,
  });

})();
