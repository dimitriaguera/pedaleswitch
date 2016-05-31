'use strict';

angular.module('pedaleswitchApp')
  .factory('mouseHelper', function (canvasControl, checkCollision, canvasDraw, $rootScope) {

    var dragIdx,
        dragOffsetX,
        dragOffsetY;
    
    var update = function (handle) {
      document.body.style.cursor = handle;
    };
    
    // Public API here
    return {

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
        var mouseX = e.layerX,
            mouseY = e.layerY;

        // Affecte la nouvelle position.
        ontable[dragIdx].setCenterX(mouseX - dragOffsetX);
        ontable[dragIdx].setCenterY(mouseY - dragOffsetY);

        // Deplace si la nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(ontable[dragIdx]);

        // Bouge les composants.
        if(!canvasControl.getDeb()){
          var compos = ontable[dragIdx].composants;
          for(var i=0; i<compos.length; i++){
            compos[i].setX(ontable[dragIdx].pos.x + compos[i].pos_default.x);
            compos[i].setY(ontable[dragIdx].pos.y + compos[i].pos_default.y);
          }
        }

        checkCollision.check(ontable[dragIdx], ontable);

        canvasDraw.drawStuff();


        var tab = checkCollision.checkLine(ontable[dragIdx], ontable);

        var canvas = canvasControl.getCanvas(),
          ctx = canvasControl.getCtx(),
          i;

        for (i = 0 ; i < tab.x.length ; i++) {
          ctx.beginPath();
          ctx.save();
          ctx.setLineDash([10, 3]);
          if (tab.x[i].isPile) {
            ctx.strokeStyle = '#ff0000';
          }
          ctx.moveTo(tab.x[i].x,0);
          ctx.lineTo(tab.x[i].x,canvas.height);
          ctx.stroke();
          ctx.closePath();
          ctx.restore();
        }
        for (i = 0 ; i < tab.y.length ; i++) {
          ctx.beginPath();
          ctx.save();
          ctx.setLineDash([10, 3]);
          if (tab.y[i].isPile) {
            ctx.strokeStyle = '#ff0000';
          }
          ctx.moveTo(0,tab.y[i].y);
          ctx.lineTo(canvas.width,tab.y[i].y);
          ctx.stroke();
          ctx.closePath();
          ctx.restore();
        }



      },

      mouseup: function (e) {
        var ontable = canvasControl.getTableActive();

        var mouseX = e.layerX,// - mousehelper.canvas.offsetLeft,
            mouseY = e.layerY;// - mousehelper.canvas.offsetTop;

        // Deselection et met le curseur de la souris normal.
        ontable[dragIdx].setSelected(false);
        update('default');

        // Nouvelle position.
        ontable[dragIdx].setCenterX(mouseX - dragOffsetX);
        ontable[dragIdx].setCenterY(mouseY - dragOffsetY);

        // Deplace si la nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(ontable[dragIdx]);

        // Bouge les composants.
        if(!canvasControl.getDeb()){
          var compos = ontable[dragIdx].composants;
          for(var i=0; i<compos.length; i++){
            compos[i].setX(ontable[dragIdx].pos.x + compos[i].pos_default.x);
            compos[i].setY(ontable[dragIdx].pos.y + compos[i].pos_default.y);
          }
        }

        // Regarde les collisions.
        checkCollision.checkall(ontable);

        // Desine
        canvasDraw.drawStuff();

        // Enlève le listener.
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
