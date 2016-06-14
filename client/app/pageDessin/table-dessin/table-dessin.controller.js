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
          rotate: '&',
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
          
          // Check les bordures de la boite
          // Puis dans la tables actives.
          canv.addEventListener("mousemove", mouseHelper.mouseMove);

          // Listener pour regarder si l'on a cliquer sur :
          // Check les bordures de la boite
          // Check la boite
          // Check les obj
          canv.addEventListener("mousedown", mouseHelper.mouseDown);

          var handler1 = $rootScope.$on('click-on-border-boite', function(){
            canv.removeEventListener("mousemove", mouseHelper.mouseMove);
            canv.addEventListener("mousemove", mouseHelper.mouseMoveBorderBoite);
            canv.addEventListener("mouseup", mouseHelper.mouseUp);
          });

          var handler2 = $rootScope.$on('click-on-boite', function(){
            canv.removeEventListener("mousemove", mouseHelper.mouseMove);
            canv.addEventListener("mousemove", mouseHelper.mouseMoveBoite);
            canv.addEventListener("mouseup", mouseHelper.mouseUp);
          });

          var handler3 = $rootScope.$on('click-on-thing', function(){
            canv.removeEventListener("mousemove", mouseHelper.mouseMove);
            canv.addEventListener("mousemove", mouseHelper.mouseMoveThing);
            canv.addEventListener("mouseup", mouseHelper.mouseUp);
          });

          var handler4 = $rootScope.$on('click-on-deco', function(){
            canv.removeEventListener("mousemove", mouseHelper.mouseMove);
            canv.addEventListener("mousemove", mouseHelper.mouseMoveDeco);
            canv.addEventListener("mouseup", mouseHelper.mouseUp);
          });

          var nohandler = $rootScope.$on('no-click-on-element', function(){
            canv.removeEventListener("mousemove", mouseHelper.mouseMoveBorderBoite);
            canv.removeEventListener("mousemove", mouseHelper.mouseMoveBoite);
            canv.removeEventListener("mousemove", mouseHelper.mouseMoveThing);
            canv.removeEventListener("mousemove", mouseHelper.mouseMoveDeco);
            canv.removeEventListener("mouseup", mouseHelper.mouseUp);

            canv.addEventListener("mousemove", mouseHelper.mouseMove);
          });

          scope.$on('$destroy', function(){
            handler1();
            handler2();
            handler3();
            handler4();
            nohandler();
          });
        }
        
      }
    });

})();