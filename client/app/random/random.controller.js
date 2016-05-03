'use strict';
(function(){

class RandomComponent {
  constructor($http, socket) {
    this.$http = $http;

    socket.socket.on('DummyJsonEvents:message', function(mess) {
      alert('Le serveur a un message pour vous : ' + mess);
    });
  }

  randJson(){
    this.$http.get('/api/dummyjsons/composant').then(response => {
      this.json = response.data;
  });
  }

  randJson2() {
    this.$http.get('/api/dummyjsons/effet').then(response => {
      this.json = response.data;
  });
  }

}

angular.module('pedaleswitchApp')
  .component('random', {
    templateUrl: 'app/random/random.html',
    controller: RandomComponent
  });

})();
