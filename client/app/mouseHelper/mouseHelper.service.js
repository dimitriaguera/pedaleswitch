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
          ontable[dragIdx].resetCompPos();
        }

        // Check les collisions entre l'item déplacer et la table active.
        checkCollision.check(ontable[dragIdx], ontable);

        // Check l'alignement des things.
        canvasControl.setTableAlignLine(checkCollision.checkLine(ontable[dragIdx], ontable));

        // Dessine.
        canvasDraw.drawStuff();
        
      },

      mouseup: function (e) {

        var ontable = canvasControl.getTableActive();
        var boite = canvasControl.getBoite();


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
          ontable[dragIdx].resetCompPos();
        }

        // Check all collision.
        checkCollision.checkall(ontable);
        
        // Bouge boite.
        boite.checkBorderBoite(ontable[dragIdx]);
        
        // Dessine.
        canvasDraw.drawStuff();
        dragIdx = -1;
        
        // Enlève le listener
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
