'use strict';
(function(){

angular.module('pedaleswitchApp')
    .directive('tableDessin', function(canvasGlobalServ, canvasControl, canvasDraw, mouseHelper, $rootScope){
      return {
        restrict: 'E',
        templateUrl: 'app/pageDessin/table-dessin/table-dessin.html',
        scope: {
          tableData: '=',
          tableMenu: '=',
          actions:'=',
          items: '<'
        },
        
        link: function(scope, element) {
          //var canvWindow = angular.element(document.getElementById('canvas-window'));
          var canvWindow = $('#canvas-window');
          var canv = document.getElementById('canvas-dessin');
          var ctx = canv.getContext('2d');
          canvasGlobalServ.setCanvas(canv);
          canvasGlobalServ.setCanvasWindow(canvWindow);
          canvasGlobalServ.setCtx(ctx);

          // Check canvas size.
          canvasControl.resizeCanvas();

          // Draw canvas.
          if (canvasGlobalServ.getTableActive().length > 0){
            canvasDraw.drawStuff();
          }
          
          // Check les bordures de la boite
          // Puis dans la tables actives.
          canv.addEventListener('mousemove', mouseHelper.mouseMove);

          // MouseUp par default : passe les selects à false.
          canv.addEventListener('mouseup', mouseHelper.mouseUpDefault);

          // Listener pour regarder quand on clique.
          canv.addEventListener('mousedown', mouseHelper.mouseDown);

          // Quand on sort du canvas.
          canv.addEventListener('mouseout', mouseHelper.mouseOut);

          var handler1 = $rootScope.$on('click-on-border-boite', function(){
            canv.removeEventListener('mouseup', mouseHelper.mouseUpDefault);
            canv.removeEventListener('mousemove', mouseHelper.mouseMove);
            canv.addEventListener('mousemove', mouseHelper.mouseMoveBorderBoite);
            canv.addEventListener('mouseup', mouseHelper.mouseUp);
          });

          var handler2 = $rootScope.$on('click-on-boite', function(){
            canv.removeEventListener('mouseup', mouseHelper.mouseUpDefault);
            canv.removeEventListener('mousemove', mouseHelper.mouseMove);
            canv.addEventListener('mousemove', mouseHelper.mouseMoveBoite);
            canv.addEventListener('mouseup', mouseHelper.mouseUp);
          });

          var handler3 = $rootScope.$on('click-on-thing', function(){
            canv.removeEventListener('mouseup', mouseHelper.mouseUpDefault);
            canv.removeEventListener('mousemove', mouseHelper.mouseMove);
            canv.addEventListener('mousemove', mouseHelper.mouseMoveThing);
            canv.addEventListener('mouseup', mouseHelper.mouseUp);
          });

          var handler4 = $rootScope.$on('click-on-deco', function(){
            canv.removeEventListener('mouseup', mouseHelper.mouseUpDefault);
            canv.removeEventListener('mousemove', mouseHelper.mouseMove);
            canv.addEventListener('mousemove', mouseHelper.mouseMoveDeco);
            canv.addEventListener('mouseup', mouseHelper.mouseUp);
          });

          var handler5 = $rootScope.$on('click-on-corner-side-boite', function(){
            canv.removeEventListener('mouseup', mouseHelper.mouseUpDefault);
            canv.removeEventListener('mousemove', mouseHelper.mouseMove);
            canv.addEventListener('mousemove', mouseHelper.mouseMoveCornerSideBoite);
            canv.addEventListener('mouseup', mouseHelper.mouseUp);
          });

          var handler6 = $rootScope.$on('click-on-corner-deco', function(){
            canv.removeEventListener('mouseup', mouseHelper.mouseUpDefault);
            canv.removeEventListener('mousemove', mouseHelper.mouseMove);
            canv.addEventListener('mousemove', mouseHelper.mouseMoveCornerDeco);
            canv.addEventListener('mouseup', mouseHelper.mouseUp);
          });

          var nohandler = $rootScope.$on('no-click-on-element', function(){
            canv.removeEventListener('mousemove', mouseHelper.mouseMoveBorderBoite);
            canv.removeEventListener('mousemove', mouseHelper.mouseMoveBoite);
            canv.removeEventListener('mousemove', mouseHelper.mouseMoveThing);
            canv.removeEventListener('mousemove', mouseHelper.mouseMoveDeco);
            canv.removeEventListener('mousemove', mouseHelper.mouseMoveCornerSideBoite);
            canv.removeEventListener('mousemove', mouseHelper.mouseMoveCornerDeco);
            canv.removeEventListener('mouseup', mouseHelper.mouseUp);

            canv.removeEventListener('mousemove', mouseHelper.mouseMoveColor);
            canv.removeEventListener('mousedown', mouseHelper.mouseDownColor);
            
            canv.addEventListener('mouseup', mouseHelper.mouseUpDefault);
            canv.addEventListener('mousemove', mouseHelper.mouseMove);
            canv.addEventListener('mousedown', mouseHelper.mouseDown);
          });

          var colorHandler = $rootScope.$on('color', function(){
            canv.removeEventListener('mousemove', mouseHelper.mouseMove);
            canv.removeEventListener('mousemove', mouseHelper.mouseMoveDeco);
            canv.removeEventListener('mouseup', mouseHelper.mouseUp);
            canv.removeEventListener('mousedown', mouseHelper.mouseDown);

            canv.addEventListener('mousemove', mouseHelper.mouseMoveColor);
            canv.addEventListener('mousedown', mouseHelper.mouseDownColor);
          });
          
          
          scope.$on('$destroy', function(){
            handler1();
            handler2();
            handler3();
            handler4();
            handler5();
            handler6();
            nohandler();
            colorHandler();
          });
        }
        
      };
    });

})();