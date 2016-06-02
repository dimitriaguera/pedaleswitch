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
          
          if (ontable[dragIdx].constructor.name === "Boite"){
            ontable[dragIdx].old_pos.x = ontable[dragIdx].pos.x;
            ontable[dragIdx].old_pos.y = ontable[dragIdx].pos.y;
          }
          
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

        // Deplace l'obj si sa nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(ontable[dragIdx]);

        // Si on deplace la boite il faut bouger les effets et les compos.
        if (ontable[dragIdx].constructor.name === "Boite"){
          ontable[dragIdx].moveEffetCompo();
        }
        // On deplace soit un effet soit un composants.
        else {
          // Bouge les composants si non debraillable.
          if(!canvasControl.getDeb()){
            ontable[dragIdx].resetCompPos();
          }
        }
        
        // Check les collisions entre l'item déplacé et la table active.
        checkCollision.check(ontable[dragIdx], ontable);

        // Check l'alignement des things.
        canvasControl.setTableAlignLine(checkCollision.checkLine(ontable[dragIdx], ontable));

        // Dessine.
        canvasDraw.drawStuff();
      },

      //@todo peut etre mettre la ligne $rootScope.$emit('no-click-on-element');
      // Au tout debut pour enlever le listener meme s'il y a eu des problèmes.
      mouseup: function (e) {

        var ontable = canvasControl.getTableActive();
        var boite = canvasControl.getBoite();


        var mouseX = e.layerX,// - mousehelper.canvas.offsetLeft,
            mouseY = e.layerY;// - mousehelper.canvas.offsetTop;

        // Enlève le listener
        $rootScope.$emit('no-click-on-element');

        // Deselection et met le curseur de la souris normal.
        ontable[dragIdx].setSelected(false);
        update('default');

        // Nouvelle position.
        ontable[dragIdx].setCenterX(mouseX - dragOffsetX);
        ontable[dragIdx].setCenterY(mouseY - dragOffsetY);

        // Deplace si la nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(ontable[dragIdx]);
        
        
        if (ontable[dragIdx].constructor.name === "Boite") {
          ontable[dragIdx].moveEffetCompo();
        }
        // On deplace soit un effet soit un composants.
        else {
          // Bouge les composants si non debraillable.
          if(!canvasControl.getDeb()){
            ontable[dragIdx].resetCompPos();
          }
          // Bouge boite.
          boite.checkBorderBoite(ontable[dragIdx]);
        }

        // Enlève les lignes d'alignement.
        canvasControl.setTableAlignLine([]);

        // Check all collision.
        checkCollision.checkall(ontable);

        // Recalcule les positions de fleches.
        canvasControl.setArrowPos();

        // Dessine.
        canvasDraw.drawStuff();
        dragIdx = -1;
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
