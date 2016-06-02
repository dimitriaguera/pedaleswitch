'use strict';
(function(){

  angular.module('pedaleswitchApp')
    .directive('boxDessin', function () {
      return {
        restrict: 'EA',
        transclude: true,
        templateUrl: 'app/pageDessin/box-dessin/box-dessin.html',
        bindToController: {
          data: '='
        },
        controller: function ($scope) {

          $scope.test = this.data.pos_box;
          $scope.getStyle = function(){
            console.log('coool');
            var result = "top:" + $scope.item.pos_box.y + "px;left:" + $scope.item.pos_box.x + "px;position:absolute;z-index:2000;";
            return result;
          };

          //$scope.posX = $scope.item.pos_box.x;

          //$scope.posY = $scope.item.pos_box.y;
          //
          //function newBoxPos(newValue, oldValue, scope) {
          //  scope.posX = newValue.x;
          //  scope.posY = newValue.y;
          //}
          //
          //$scope.$watch("item", newBoxPos, true);
        },
        controllerAs: '$ctrl',
        link: function (scope, element, attr) {


        }
      }
    });

})();