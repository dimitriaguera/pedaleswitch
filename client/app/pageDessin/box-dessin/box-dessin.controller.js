'use strict';
(function(){

  angular.module('pedaleswitchApp')
    .directive('boxDessin', function () {
      return {
        restrict: 'EA',
        transclude: true,
        template: '<div ng-transclude>' +
                  '</div ng-transclude>',
        bindToController: {
          data: '='
        },
        controller: function ($scope) {
          $scope.data = this.data;
        },
        controllerAs: '$ctrl',
        link: function (scope, element, attr) {

          var leftPx = scope.data.pos_start.x;
          var rightPx = scope.data.pos_start.y;

          element.css({
            "position": "absolute",
            "z-index": "2000",
            "top": rightPx.toString() + 'px',
            "left": leftPx.toString() + 'px'
          });
        }
      }
    });

})();