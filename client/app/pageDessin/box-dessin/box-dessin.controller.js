'use strict';
(function(){

  angular.module('pedaleswitchApp')
    .directive('boxDessin', function () {
      
      return {
        restrict: 'EA',
        transclude: true,
        templateUrl: 'app/pageDessin/box-dessin/box-dessin.html',
        bindToController: {
          data: '=',
          boxAction: '&'
        },
        controller: function ($scope) {
          $scope.data = this.data;

          this.validation = function (){
            this.data.setValue(this.value);
            this.value = null;
            this.boxAction();
          };
        },
        controllerAs: '$ctrl',
      }

    });

})();