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
