'use strict';

angular.module('pedaleswitchApp')
  .directive('droppable', function (canvasControl, canvasDraw, instanceDessin, checkCollision) {
    return {

      link: function(scope, element) {
        // again we need the native object
        var el = element[0];

        el.addEventListener(
          'dragover',
          function(e) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) e.preventDefault();
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragenter',
          function(e) {
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragleave',
          function(e) {
            this.classList.remove('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'drop',
          function(e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) e.stopPropagation();

            // Remove class over.
            this.classList.remove('over');


            /*
            // Function to calculate the absolute position
            var offset = function (el, event) {
              var ox = -el.offsetLeft,
                oy = -el.offsetTop;
              while (el = el.offsetParent) {
                ox += el.scrollLeft - el.offsetLeft;
                oy += el.scrollTop - el.offsetTop;
              }
              return [event.clientX + ox, event.clientY + oy];
            };

            var coords = offset(e.target, e);
            */


            var obj = JSON.parse(e.dataTransfer.getData('data'));

            var mouseX = e.layerX,
                mouseY = e.layerY;

            var effet = instanceDessin.searchEffetInDessin(obj._id, obj.key);
            var dessin = instanceDessin.getDessin();

            if(effet && !effet.in_canvas) {
              effet.pos.x = mouseX - (effet.size.w / 2);
              effet.pos.y = mouseY - (effet.size.h / 2);

              var canvaseffet = canvasControl.addToCanvas(effet);
              canvasControl.moveCloseBorder(canvaseffet);

              if(!canvasControl.getDeb()){
                var compos = canvaseffet.composants;
                for(var i=0; i<compos.length; i++){
                  compos[i].setX(canvaseffet.pos.x + compos[i].pos_default.x);
                  compos[i].setY(canvaseffet.pos.y + compos[i].pos_default.y);
                }
              }
              
              canvasControl.addToCanvas(effet);
              dessin.boite = canvasControl.getBoite();
              checkCollision.checkall(canvasControl.getTableActive());
              canvasDraw.drawStuff();
            }
            return false;
          },
          false
        );


      }
    };
  });
