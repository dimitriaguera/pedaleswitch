'use strict';
(function(){

angular.module('pedaleswitchApp')
    .directive('tableDessin', function(canvasControl, mouseHelper, $rootScope){
      return {
        restrict: 'E',
        templateUrl: 'app/pageDessin/table-dessin/table-dessin.html',
        scope: {
          activeTable: '<'
        },
        link: function(scope, element) {
          var canv = document.getElementById('canvas-dessin');
          var ctx = canv.getContext('2d');
          canvasControl.setCtx(ctx);
          canvasControl.setCanvas(canv);

          var mousemove = mouseHelper.mousemove(scope.activeTable);
          var mouseup = mouseHelper.mouseup(scope.activeTable);

          canv.addEventListener("mousedown", mouseHelper.mousedown(scope.activeTable));
          var handler = $rootScope.$on('click-on-element', function(){
            canv.addEventListener("mousemove", mousemove);
            canv.addEventListener("mouseup", mouseup);
          });

          var nohandler = $rootScope.$on('no-click-on-element', function(){
            canv.removeEventListener("mousemove", mousemove);
            canv.removeEventListener("mouseup", mouseup);
          });
          scope.$on('$destroy', function(){
            handler();
            nohandler();
          });
        },
      }
    });

})();