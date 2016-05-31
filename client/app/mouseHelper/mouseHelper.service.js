'use strict';

angular.module('pedaleswitchApp')
  .factory('mouseHelper', function (canvasControl, checkCollision, canvasDraw, $rootScope) {

    var dragIdx;
    var dragOffsetX;
    var dragOffsetY;
    var update = function (handle) {
      document.body.style.cursor = handle;
    };


    // Public API here
    return {

      //update: function (handle) {
      //  document.body.style.cursor = handle;
      //},

      mousedown: function (e) {

          var ontable = canvasControl.getTableActive();
          var mouseX = e.layerX,
              mouseY = e.layerY;
        
          var dragid = checkCollision.checkmousebox({x: mouseX, y: mouseY}, ontable, 10);

          if (dragid !== false) {
            dragIdx = dragid.id;
            dragOffsetX = dragid.dx;
            dragOffsetY = dragid.dy;
            ontable[dragIdx].setSelected(true);
            update('move');
            $rootScope.$emit('click-on-element');
            canvasDraw.drawStuff();
          }
      },

      mousemove: function (e) {

          var ontable = canvasControl.getTableActive();
          var boite = canvasControl.getBoite();
          var mouseX = e.layerX,
              mouseY = e.layerY;

          ontable[dragIdx].setCenterX(mouseX - dragOffsetX);
          ontable[dragIdx].setCenterY(mouseY - dragOffsetY);

          if(!canvasControl.getDeb()){
            var compos = ontable[dragIdx].composants;
            for(var i=0; i<compos.length; i++){
              compos[i].setX(ontable[dragIdx].pos.x + compos[i].pos_default.x);
              compos[i].setY(ontable[dragIdx].pos.y + compos[i].pos_default.y);
            }
          }

          checkCollision.checkall(ontable);
        
          canvasDraw.drawStuff();
      },

      mouseup: function (e) {
          var ontable = canvasControl.getTableActive();
          var boite = canvasControl.getBoite();

          var mouseX = e.layerX,// - mousehelper.canvas.offsetLeft,
              mouseY = e.layerY;// - mousehelper.canvas.offsetTop;

          ontable[dragIdx].setCenterX(mouseX - dragOffsetX);
          ontable[dragIdx].setCenterY(mouseY - dragOffsetY);
          ontable[dragIdx].setSelected(false);
          update('default');

          checkCollision.checkall(ontable);
          boite.checkBorderBoite(ontable[dragIdx]);
          canvasDraw.drawStuff();
          dragIdx = -1;
          $rootScope.$emit('no-click-on-element');
      },

      mousemovebox: function (e) {
        var ontable = canvasControl.getTableActive();

        var mouseX = e.layerX, //- mousehelper.canvas.offsetLeft,
            mouseY = e.layerY; //- mousehelper.canvas.offsetTop;

        canvasControl.resetIsSelected(ontable);
        var onElement = checkCollision.checkmousebox({x: mouseX, y: mouseY}, ontable, 10);

        if(onElement) {
          ontable[onElement.id].setSelected(true);
          update('pointer');
        }
        else {
          update('default');
        }
        canvasDraw.drawStuff();
      }

    };
  });
