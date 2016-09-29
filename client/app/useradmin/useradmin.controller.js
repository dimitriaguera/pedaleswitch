'use strict';

(function() {

class UserAdminController {

  constructor(Auth, $http, FileSaver, Blob) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;

    this.fileSaver = FileSaver;
    this.blob = Blob;

    this.$http = $http;
  }

  $onInit(){
    // this.$http.get('/api/composants').then(response => {
    //   this.composants = response.data;
    // });
    this.user = this.getCurrentUser();
    // {"_id":"57eaad097e45cc202523f292","provider":"local","name":"Admin","email":"admin@example.com","__v":0,"role":"admin"}
    // console.log(JSON.stringify(this.user));
  }


  addPath() {
    if (this.path) {
      this.$http.post('/api/userData', { file: this.path }).then(function successCallback(response) {
        // Si succes de la requete.
        console.log(JSON.stringify(response));
      }, function errorCallback(response) {
        // Si requete rejetée.
        console.log('bad');
      });
    }
  }

  findPath(){
    var $this = this;
    this.myImg = '';
    $this.$http.get('/api/userData/test', {responseType: 'arraybuffer'}).then(
      function successCallback(res) {
        //get filname
        //$this.filename = res.headers('Content-Disposition').match(/filename="(.+)"/)[1];

        res.headers('Content-Type');
        // L'image est binaire la transforme en blob pour en fournir un url.
        var blob = new Blob([res.data],{type: res.headers('Content-Type')});

        $this.myImg = (window.URL || window.webkitURL).createObjectURL(blob);
      },
      function errorCallback(res) {
        alert("The url could not be loaded...\n (network error? non-valid url? server offline? etc?)");
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );
  }

  download(){
    var $this = this;

    $this.$http.get('/api/userData/test').then(
      function successCallback(res) {
        // L'image est binaire la transforme en blob pour en fournir un url.
        //{type: res.headers('Content-Type')}
        var blob = new Blob([res.data],  {type: 'image/png'});
        $this.fileSaver.saveAs(blob, 'test');
      },
      function errorCallback(res) {
        alert("The url could not be loaded...\n (network error? non-valid url? server offline? etc?)");
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }
    );


  }

}

angular.module('pedaleswitchApp')
  .component('useradmin', {
    templateUrl: 'app/useradmin/useradmin.html',
    controller: UserAdminController
  });

})();
