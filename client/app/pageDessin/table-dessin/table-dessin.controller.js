'use strict';
(function(){

angular.module('pedaleswitchApp')
    .directive('tableDessin', function(canvasControl, mouseHelper, $rootScope){
      return {
        restrict: 'E',
        templateUrl: 'app/pageDessin/table-dessin/table-dessin.html',
        scope: {},
        link: function(scope, element) {
          var canv = document.getElementById('canvas-dessin');
          var ctx = canv.getContext('2d');
          canvasControl.setCtx(ctx);
          canvasControl.setCanvas(canv);

          canvasControl.drawRulers();

          canv.addEventListener("mousedown", mouseHelper.mousedown);
          canv.addEventListener("mousemove", mouseHelper.mousemovebox);

          var handler = $rootScope.$on('click-on-element', function(){
            canv.removeEventListener("mousemove", mouseHelper.mousemovebox);
            canv.addEventListener("mousemove", mouseHelper.mousemove);
            canv.addEventListener("mouseup", mouseHelper.mouseup);
          });

          var nohandler = $rootScope.$on('no-click-on-element', function(){
            canv.removeEventListener("mousemove", mouseHelper.mousemove);
            canv.removeEventListener("mouseup", mouseHelper.mouseup);
            canv.addEventListener("mousemove", mouseHelper.mousemovebox);
          });

          scope.$on('$destroy', function(){
            handler();
            nohandler();
          });
        },
      }
    });

})();