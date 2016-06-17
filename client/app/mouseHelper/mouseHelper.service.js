'use strict';

angular.module('pedaleswitchApp')
  .factory('mouseHelper', function (canvasControl, canvasConversion, checkCollision, canvasDraw, $rootScope) {

    var oldX, oldY;
    var drag = {};
    var tabActive = [];
    var boite = [];

    var timea, timeb;
    var DELAY_DRAG = 100;
    var DELAY_CLICK = 500;

    var olddragid = null;


    var mousePos = {};

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

        mousePos = {x: e.layerX, y: e.layerY};

        tabActive = canvasControl.getTableActive();
        boite = canvasControl.getBoite();

        // Met le bon pointeur de souris
        update('default');

        // Si il y a des obj dans le canvas.
        if (tabActive.length > 0) {
          // Regarde si la souris est sur un effet ou un composant.
          drag = checkCollision.checkMouseBox(mousePos, tabActive, 10);
          if (drag) {
            
            // On drague soit un obj soit un élément de déco.
            if (tabActive[drag.id].input) {
              drag.type = 'deco';
            } else {
              drag.type = 'thing';
            }
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
        }

        if (boite.titre !== undefined){
          // Regarde si la souris est sur les bordure de la boite.
          drag = checkCollision.checkMouseBorder(mousePos, [boite], 10);
          if (drag) {
            drag.type = 'borderboite';
            update(drag.pointer.type);
            return;
          }

          // Regarde si la souris est sur la boite
          drag = checkCollision.checkMouseBox(mousePos, [boite], 10);
          if(drag){
            drag.type = 'boite';
            oldX = boite.pos.x.v;
            oldY = boite.pos.y.v;
            return;
          }
        }
      },

      /**
       * Event appeler dans le canvas lors d'un mouse down.
       */
      mouseDown: function (e) {

        mousePos = {x: e.layerX, y: e.layerY};

        // Cette ligne enlève les pop-up car on commence un drag.
        canvasControl.resetActiveItem();

        // Prend le temps actuel pour savoir si click ou drag.
        timea = (new Date()).getTime();
        timeb = 0;

        // Les rootScope sont définie dans table-dessin.controller.js
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
          case 'deco':
            $rootScope.$emit('click-on-deco');
            break;
          default:
            $rootScope.$emit('no-click-on-element');
            drag = {};
        }
      },

      /**
       * On déplace de la deco
       */
      mouseMoveDeco: function(e){
        // Delais avant le drag
        timeb = (new Date()).getTime() - timea;
        if (timeb < DELAY_DRAG) {
          return;
        }
        
        // Affecte la nouvelle position.
        tabActive[drag.id].move({x: e.layerX - mousePos.x, y: e.layerY - mousePos.y});
        mousePos = {x: e.layerX, y: e.layerY};

        // Met le bon pointeur de souris
        update('move');

        
        // Dessine.
        canvasDraw.drawStuff();
      },

      /**
       * On agrandie la boite.
       *
       * @todo un bonne partie est a metre dans canvasContol
       * car par exemple les marges ne sont pas uniforme
       * canvasConversion.convertToPixel(40)
       */
      mouseMoveBorderBoite: function(e){

        // Delais avant le drag
        timeb = (new Date()).getTime() - timea;
        if (timeb < DELAY_DRAG) {
          return;
        }

        mousePos = {x: e.layerX, y: e.layerY};

        var canvas = canvasControl.getCanvas();
        var pos_max = canvasControl.findGlobalRect();

        var margin = canvasConversion.convertToPixel(40);
        var marginboite = canvasControl.getBoite().margin.v;

        // Bord haut ou bas.
        if (drag.pointer.type === 'ns-resize'){

          //Bord bas.
          if (drag.pointer.pos === 'bottom'){

            // Agrendit le canvas.
            if (mousePos.y > canvas.height * 0.8) {
              canvas.height = mousePos.y * 1.2;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mousePos.y < pos_max.b + marginboite) {
              mousePos.y = pos_max.b + marginboite;
            }

            // Redimensionne la boite.
            boite.size.h.v += mousePos.y - boite.getBottom();
          }
          //Bord haut.
          else {
            // La souris est plus haut que la marge.
            if (mousePos.y < margin){
              mousePos.y = margin;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mousePos.y > pos_max.t - marginboite) {
              mousePos.y = pos_max.t - marginboite;
            }

            // Redimensionne la boite.
            boite.size.h.v += boite.getTop() - mousePos.y;
            boite.setY(mousePos.y);
          }
        }
        // Bord gauche ou droite.
        else {
          // Bord droit.
          if (drag.pointer.pos === 'right') {
            // Agrendit le canvas.
            if (mousePos.x > canvas.width  * 0.8) {
              canvas.width = mousePos.x * 1.2;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mousePos.x < pos_max.r + marginboite) {
              mousePos.x = pos_max.r + marginboite;
            }

            // Redimensionne la boite.
            boite.size.w.v += mousePos.x - boite.getRight();
          }
          //Bord gauche.
          else {
            // La souris est plus à gauche que la marge.
            if (mousePos.x < margin) {
              mousePos.x = margin;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mousePos.x > pos_max.l - marginboite) {
              mousePos.x = pos_max.l - marginboite;
            }

            // Redimensionne la boite.
            boite.size.w.v += boite.getLeft() - mousePos.x;
            boite.setX(mousePos.x);
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
        timeb = (new Date()).getTime() - timea;
        if (timeb < DELAY_DRAG) {
          return;
        }

        // Deplace le thing.
        boite.move({x: e.layerX - mousePos.x, y: e.layerY - mousePos.y});

        // Bouge les effets et les compos.
        boite.moveEffetCompo({x: e.layerX - mousePos.x, y: e.layerY - mousePos.y});
        
        mousePos = {x: e.layerX, y: e.layerY};
        // Met le bon pointeur de souris
        update('move');

        // Deplace l'obj si sa nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(boite);

        // Bouge les effets et les compos.
        /*
        boite.moveEffetCompo({
          deltaX: boite.pos.x.v - oldX,
          deltaY: boite.pos.y.v - oldY
        });
        oldX = boite.pos.x.v;
        oldY = boite.pos.y.v;
        */


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
        timeb = (new Date()).getTime() - timea;
        if (timeb < DELAY_DRAG) {
          return;
        }

        // Deplace le thing.
        tabActive[drag.id].move({x: e.layerX - mousePos.x, y: e.layerY - mousePos.y});
        mousePos = {x: e.layerX, y: e.layerY};

        // Met le bon pointeur de souris
        update('move');

        // Deplace l'obj si sa nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(tabActive[drag.id]);

        // Bouge les composants si non debraillable.
        if (!canvasControl.getDeb()) {
          tabActive[drag.id].resetCompPos();
        }

        // @todo a sup
        //checkCollision.checktest(tabActive[drag.id], tabActive[4]);

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
        if (timeb < DELAY_CLICK && drag.type !=='boite' && tabActive[drag.id]){
          canvasControl.setActiveItem(tabActive[drag.id]);
        }

        mousePos = {};

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
