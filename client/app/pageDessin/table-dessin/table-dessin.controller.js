'use strict';
(function(){

angular.module('pedaleswitchApp')
    .directive('tableDessin', function(canvasControl, canvasDraw, mouseHelper, $rootScope){
      return {
        restrict: 'E',
        templateUrl: 'app/pageDessin/table-dessin/table-dessin.html',
        scope: {
          tableData: '=',
          tableMenu: '=',
          items: '<',
          updateComposant: '&',
          arrowChange: '&'
        },
        link: function(scope, element) {
          var canv_window = document.getElementById('canvas-window');
          var canv = document.getElementById('canvas-dessin');
          var ctx = canv.getContext('2d');
          canvasControl.setCanvasWindow(canv_window);
          canvasControl.setCanvas(canv);
          canvasControl.setCtx(ctx);

          // Check canvas size.
          canvasControl.resizeCanvas();

          // Draw canvas.
          if (canvasControl.getTableActive().length > 0){
            canvasDraw.drawStuff();
          }

          canv.addEventListener("mousedown", mouseHelper.mousedown);
          canv.addEventListener("mousemove", mouseHelper.mousemovebox);
          canv.addEventListener("click", mouseHelper.click);
          
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