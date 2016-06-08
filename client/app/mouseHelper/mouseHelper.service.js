'use strict';

angular.module('pedaleswitchApp')
  .factory('mouseHelper', function (canvasControl, canvasConversion, checkCollision, canvasDraw, $rootScope) {

    var mouseX, mouseY;

    var oldX, oldY;
    var drag = {};
    var tabActive = [];
    var boite = [];

    var timea, timeb;
    var TOUCHDELAY = 175;

    var olddragid = null;



    /**
     * Change la forme du pointeur de la souris.
     */
    var update = function (handle) {
      document.body.style.cursor = handle;
    };

    return {

      /**
       * Listener quand la souris bouge mais ne clique pas.
       * Check les bordures de la boite
       * Puis dans la tables actives.
       * Quand on clique on passe au listener mousedown (cf. table-dessin.controller.js dans le link).
       */
      mouseMove: function (e) {
        mouseX = e.layerX; //- mousehelper.canvas.offsetLeft,
        mouseY = e.layerY; //- mousehelper.canvas.offsetTop;


        tabActive = canvasControl.getTableActive();
        boite = canvasControl.getBoite();

        // Met le bon pointeur de souris
        update('default');

        // Si il y a des obj dans le canvas.
        if (tabActive.length > 0){

          // Regarde si la souris est sur un effet ou un composant.
          drag = checkCollision.checkMouseBox({x: mouseX, y: mouseY}, tabActive, 10);
          if (drag) {
            drag.type = 'thing';
            // Met isSelect a l'objet en cours
            // Et enlève l'ancien selectionner.
            // Redraw si necaissaire.
            if (olddragid !== drag.id){
              tabActive[drag.id].setSelected(true);
              if (olddragid !== null){
                tabActive[olddragid].setSelected(false);
              }
              olddragid = drag.id;
              canvasDraw.drawStuff();
            }
            return;
          }
          else {
            // Si on est pas sur un obj mais
            // qu'avant oui alors le deselectionner
            // et redessine.
            if (olddragid !== null){
              tabActive[olddragid].setSelected(false);
              canvasControl.resetActiveItem();
              canvasDraw.drawStuff();
            }
            olddragid = null;
          }

          // Regarde si la souris est sur les bordure de la boite.
          drag = checkCollision.checkMouseBorder({x: mouseX, y: mouseY}, [boite], 10);
          if (drag) {
            drag.type = 'borderboite';
            update(drag.pointer.type);
            return;
          }

          // Regarde si la souris est la boite
          drag = checkCollision.checkMouseBox({x: mouseX, y: mouseY}, [boite], 10);
          if(drag){
            drag.type = 'boite';
            oldX = boite.pos.x;
            oldY = boite.pos.y;
            return;
          }
        }
      },

      /**
       * Event appeler dans le canvas lors d'un mouse down.
       */
      mouseDown: function (e) {

        // Cette ligne enlève les pop-up car on commence un drag.
        canvasControl.resetActiveItem();

        // Prend le temps actuel pour savoir si click ou drag.
        timea = (new Date()).getTime();
        timeb = 0;

        switch(drag.type) {
          case 'thing':
            $rootScope.$emit('click-on-thing');
            break;
          case 'boite':
            $rootScope.$emit('click-on-boite');
            break;
          case 'borderboite':
            $rootScope.$emit('click-on-border-boite');
            break;
          default:
            $rootScope.$emit('no-click-on-element');
            drag = {};
        }
      },


      /**
       * On agrandie la boite.
       *
       * @todo un bonne partie est a metre dans canvasContole
       * car par exemple les marges ne sont pas uniforme
       * canvasConversion.convertToPixel(40)
       */
      mouseMoveBorderBoite: function(e){

        // Delais avant le drag
        if (timeb < TOUCHDELAY) {
          timeb = (new Date()).getTime() - timea;
          return;
        }

        mouseX = e.layerX;
        mouseY = e.layerY;

        var canvas = canvasControl.getCanvas();
        var pos_max = canvasControl.findTop();

        var margin = canvasConversion.convertToPixel(40);
        var marginboite = canvasControl.getBoite().margin;

        // Bord haut ou bas.
        if (drag.pointer.type === 'ns-resize'){

          //Bord bas.
          if (drag.pointer.pos === 'bottom'){

            // Agrendit le canvas.
            if (mouseY > canvas.height * 0.8) {
              canvas.height = mouseY * 1.2;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mouseY < pos_max.b + marginboite) {
              mouseY = pos_max.b + marginboite;
            }

            // Redimensionne la boite.
            boite.size.h += mouseY - boite.getBottom();
          }
          //Bord haut.
          else {
            // La souris est plus haut que la marge.
            if (mouseY < margin){
              mouseY = margin;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mouseY > pos_max.t - marginboite) {
              mouseY = pos_max.t - marginboite;
            }

            // Redimensionne la boite.
            boite.size.h += boite.getTop() - mouseY;
            boite.setY(mouseY);
          }
        }
        // Bord gauche ou droite.
        else {
          // Bord droit.
          if (drag.pointer.pos === 'right') {
            // Agrendit le canvas.
            if (mouseX > canvas.width  * 0.8) {
              canvas.width = mouseX * 1.2;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mouseX < pos_max.r + marginboite) {
              mouseX = pos_max.r + marginboite;
            }

            // Redimensionne la boite.
            boite.size.w += mouseX - boite.getRight();
          }
          //Bord gauche.
          else {
            // La souris est plus à gauche que la marge.
            if (mouseX < margin) {
              mouseX = margin;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mouseX > pos_max.l - marginboite) {
              mouseX = pos_max.l - marginboite;
            }

            // Redimensionne la boite.
            boite.size.w += boite.getLeft() - mouseX;
            boite.setX(mouseX);
          }
        }

        // Recalcule les positions de fleches entourant la boite.
        canvasControl.setArrowPos();
        canvasDraw.drawStuff();

      },

      /**
       * On bouge la boite.
       */
      mouseMoveBoite: function(e) {

        // Delais avant le drag
        if (timeb < TOUCHDELAY) {
          timeb = (new Date()).getTime() - timea;
          return;
        }

        mouseX = e.layerX;
        mouseY = e.layerY;

        // Affecte la nouvelle position.
        boite.setCenterX(mouseX - drag.dx);
        boite.setCenterY(mouseY - drag.dy);

        // Deplace l'obj si sa nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(boite);
        
        // Bouge les effets et les compos.
        boite.moveEffetCompo({
          deltaX: boite.pos.x - oldX,
          deltaY: boite.pos.y - oldY
        });
        oldX = boite.pos.x;
        oldY = boite.pos.y;

        // Recalcule les positions de fleches entourant la boite.
        canvasControl.setArrowPos();
        // Dessine.
        canvasDraw.drawStuff();
      },

      /**
       * On deplace un obj
       */
      mouseMoveThing: function(e) {

        // Delais avant le drag
        if (timeb < TOUCHDELAY) {
          timeb = (new Date()).getTime() - timea;
          return;
        }

        mouseX = e.layerX;
        mouseY = e.layerY;

        // Affecte la nouvelle position.
        tabActive[drag.id].setCenterX(mouseX - drag.dx);
        tabActive[drag.id].setCenterY(mouseY - drag.dy);

        // Deplace l'obj si sa nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(tabActive[drag.id]);

        // Bouge les composants si non debraillable.
        if (!canvasControl.getDeb()) {
          tabActive[drag.id].resetCompPos();
        }
        // Check les collisions entre l'item déplacé et la table active.
        checkCollision.check(tabActive[drag.id], tabActive);
        // Check l'alignement des things.
        canvasControl.setTableAlignLine(checkCollision.checkLine(tabActive[drag.id], tabActive));
        // Redimensionne la boite.
        boite.checkBorderBoite(tabActive[drag.id]);
        // Recalcule les positions de fleches entourant la boite.
        canvasControl.setArrowPos();
        // Dessine.
        canvasDraw.drawStuff();
      },


      /**
       * Mouse up.
       */
      mouseUp: function (e) {

        // Verifier si on click ou si on draggue pour l'affichage des pop-up.
        timeb = (new Date()).getTime() - timea;
        // Si oui on click.
        if (timeb < TOUCHDELAY && tabActive[drag.id]){
          canvasControl.setActiveItem(tabActive[drag.id]);
        }

        // Met le bon pointeur de souris
        update('default');

        // Enlève le listener
        $rootScope.$emit('no-click-on-element');

        // Check all collision.
        checkCollision.checkAll(tabActive);
        
        // Enlève les lignes d'alignement.
        canvasControl.setTableAlignLine([]);

        canvasDraw.drawStuff();
      }
      

    };
  });
