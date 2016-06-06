'use strict';

angular.module('pedaleswitchApp')
  .factory('mouseHelper', function (canvasControl, checkCollision, canvasDraw, $rootScope) {

    var mouseX, mouseY;

    var oldX, oldY;
    var drag = {};
    var tabActive = [], oldTabActive = [];
        //oldTabThin = [], oldTabDash = [], oldTabShine = [];

    // Change la forme du pointeur de la souris.
    var update = function (handle) {
      document.body.style.cursor = handle;
    };

    // Check si la souris est sur un obj de tabActive.
    var checkmouse = function(table){
      // Regarde si on a cliquer sur un obj contenue dans tabActive
      var drag = checkCollision.checkmousebox({x: mouseX, y: mouseY}, table, 10);
      // Si oui met l'id dans dans drag.id et l'écart entre la souris et le baricentre de l'obj dragué.
      if (drag !== false) {
        table[drag.id].setSelected(true);
        update('move');
        $rootScope.$emit('click-on-element');
        canvasDraw.drawStuff();
      }
      return drag;
    };

    // Check si la souris est sur un obj de tabActive.
    var checkmousemenu = function(table){
      // Regarde si on a cliquer sur un obj contenue dans tabActive
      var drag = checkCollision.checkmousebox({x: mouseX, y: mouseY}, table, 10);
      // Si oui met l'id dans dans drag.id et l'objet dans activeItem.
      if (drag !== false) {
        table[drag.id].setSelected(true);
        canvasControl.setActiveItem(table[drag.id]);
        $rootScope.$emit('no-click-on-element');
        canvasDraw.drawStuff();
      }
      return drag;
    };


    return {

      click: function (e) {
        mouseX = e.layerX;
        mouseY = e.layerY;

        // Regarde si la souris est sur un effet ou un composant.
        tabActive = canvasControl.getTableActive();
        drag = checkmousemenu(tabActive);
        if (drag === false) {
          canvasControl.resetActiveItem();
        };
      },

      mousedown: function (e) {
        mouseX = e.layerX;
        mouseY = e.layerY;

        // Regarde si la souris est sur un effet ou un composant.
        tabActive = canvasControl.getTableActive();
        drag = checkmouse(tabActive);

        // Si souris pas sur effet ou compo =>
        // Regarde si la souris est sur la boite.
        if(drag === false){
          drag = checkmouse([canvasControl.getBoite()]);
          // Oui on drague la boite.
          if(drag !== false){
            // Stock l'ancienne tableActive.
            oldTabActive = tabActive;
            // Change la tabActive par la boite + l'ancienne tabactive. (Hack [] ...)
            tabActive = canvasControl.setTableActive([canvasControl.getBoite()].concat(oldTabActive));
            // Stock l'ancienne position.
            oldX = tabActive[drag.id].pos.x;
            oldY = tabActive[drag.id].pos.y;
            /*
            // Enlève le is select, vide la table Thin et met en Dash tout les effets et compo.
            canvasControl.resetIsSelected(oldTabActive);
            oldTabThin = canvasControl.getTableThin();
            oldTabDash = canvasControl.getTableDashed();
            oldTabShine = canvasControl.getTableShine();
            canvasControl.resetTableThin();
            canvasControl.setTableDashed(canvasControl.getTableEffet().concat(canvasControl.getTableComposant()));
            */
          }
        }
      },

      mousemove: function (e) {
        mouseX = e.layerX;
        mouseY = e.layerY;

        // Affecte la nouvelle position.
        tabActive[drag.id].setCenterX(mouseX - drag.dx);
        tabActive[drag.id].setCenterY(mouseY - drag.dy);

        // Deplace l'obj si sa nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(tabActive[drag.id]);

        // On  deplace un compososant ou un effet.
        if (tabActive[drag.id].constructor.name !== "Boite"){
          // Bouge les composants si non debraillable.
          if(!canvasControl.getDeb()){
            tabActive[drag.id].resetCompPos();
          }
          // Check les collisions entre l'item déplacé et la table active.
          checkCollision.check(tabActive[drag.id], tabActive);
          // Check l'alignement des things.
          canvasControl.setTableAlignLine(checkCollision.checkLine(tabActive[drag.id], tabActive));
        }
        // On deplace la boite.
        else {
          // Bouge les effets et les compos.
          tabActive[drag.id].moveEffetCompo({
            deltaX: tabActive[drag.id].pos.x - oldX,
            deltaY: tabActive[drag.id].pos.y - oldY 
          });
          oldX = tabActive[drag.id].pos.x;
          oldY = tabActive[drag.id].pos.y;
          // Recalcule les positions de fleches entourant la boite.
          canvasControl.setArrowPos();
        }

        // Dessine.
        canvasDraw.drawStuff();
      },


      mouseup: function (e) {
        mouseX = e.layerX;// - mousehelper.canvas.offsetLeft,
        mouseY = e.layerY;// - mousehelper.canvas.offsetTop;

        // Enlève le listener
        $rootScope.$emit('no-click-on-element');

        // Deselection et met le curseur de la souris normal.
        tabActive[drag.id].setSelected(false);
        update('default');

        // Nouvelle position.
        tabActive[drag.id].setCenterX(mouseX - drag.dx);
        tabActive[drag.id].setCenterY(mouseY - drag.dy);

        // Deplace si la nouvelle position depasse le canvas.
        canvasControl.moveCloseBorder(tabActive[drag.id]);

        // On deplace soit un effet soit un composants.
        if (tabActive[drag.id].constructor.name !== "Boite") {
          // Bouge les composants si non debraillable.
          if(!canvasControl.getDeb()){
            tabActive[drag.id].resetCompPos();
          }
          // Enlève les lignes d'alignement.
          canvasControl.setTableAlignLine([]);
          // Check all collision.
          checkCollision.checkall(tabActive);
          // Bouge boite.
          canvasControl.getBoite().checkBorderBoite(tabActive[drag.id]);
        }
        // On deplace la boite.
        else {
          // Bouge les effets et les compos.
          tabActive[drag.id].moveEffetCompo({
            deltaX: tabActive[drag.id].pos.x - oldX,
            deltaY: tabActive[drag.id].pos.y - oldY
          });
          // Enlève le is select
          canvasControl.resetIsSelected(tabActive);
          // Restaure la table active précedente.
          tabActive = oldTabActive;
          canvasControl.setTableActive(tabActive);
          /*
          canvasControl.setTableActive(tabActive);
          canvasControl.setTableDashed(oldTabDash);
          canvasControl.setTableThin(oldTabThin);
          canvasControl.setTableShine(oldTabShine);
          */
        }

        // Recalcule les positions de fleches entourant la boite.
        canvasControl.setArrowPos();

        // Dessine.
        canvasDraw.drawStuff();
        drag.id = -1;
      },

      
      // Listener quand la souris bouge mais ne clique pas
      // Quand on clique on passe au listener mousedown (cf. table-dessin.controller.js dans le link).
      mousemovebox: function (e) {

        tabActive = canvasControl.getTableActive();

        mouseX = e.layerX; //- mousehelper.canvas.offsetLeft,
        mouseY = e.layerY; //- mousehelper.canvas.offsetTop;

        canvasControl.resetIsSelected(tabActive);
        var onElement = checkCollision.checkmousebox({x: mouseX, y: mouseY}, tabActive, 10);

        if(onElement) {
          tabActive[onElement.id].setSelected(true);
          update('pointer');
        }
        else {
          update('default');
        }
        canvasDraw.drawStuff();
      }

    };
  });
