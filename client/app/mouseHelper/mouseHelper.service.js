'use strict';

angular.module('pedaleswitchApp')
  .factory('mouseHelper', function (canvasControl, canvasConversion, checkCollision, canvasDraw, $rootScope) {

    var drag = {};
    var tabActive = [];
    var boite = [];

    var timea, timeb;
    var DELAY_DRAG = 100;
    var DELAY_CLICK = 500;

    var olddragid = null;


    var mousePos = {};

    var canvasSetting = canvasControl.getCanvasSetting();

    /**
     * Change la forme du pointeur de la souris.
     */
    var update = function (handle) {
      document.body.style.cursor = handle;
    };

    /**
     * @param e event
     * @return {object} x,y, color in hex
     */
    var mouse = function(e) {
      // le +2 et le +21 depende de l'icone choisie.
      var mouse = {x: e.layerX + 2, y: e.layerY + 21};
      var data = canvasControl.getCtx().getImageData(mouse.x, mouse.y, 1, 1).data;
      var rgba = 'rgba(' + data[0] + ',' + data[1] +
        ',' + data[2] + ',' + data[3] + ')';
      var hex = '#' + tinycolor(rgba).toHex();
      mouse.color = hex;
      return mouse;
    };

    return {

      /**
       * Fonction qui est invoquer quand on clique sur pipette.
       * Enlève la pop-over.
       * Se rappelle de l'élément sélectionner.
       * Changer le curseur la souris.
       * Enlève les listener habituelle sur le canvas et en 
       * rajoute un sur mousedown.
       */
      eyedropper: function(){
        // Stock l'id de l'item actif.
        var tableText = canvasControl.getTableText();
        var activeItem = canvasControl.getActiveItem();
        drag = {};
        drag.id = canvasControl.searchTabByIdReturnIndex(tableText, activeItem[0]._id, 0);

        // Enlever le pop-up.
        canvasControl.resetActiveItem();

        // Change le pointer de la souris
        update("url('assets/images/eyedropper-24x24.png'), auto");

        // Changer les eventListener du canvas.
        $rootScope.$emit('color');
      },

      mouseMoveColor: function(e){
        mousePos = mouse(e);
        
        // change la couleur de l'item actif.
        var tableText = canvasControl.getTableText();
        tableText[drag.id].font.color = mousePos.color;

        // Dessine.
        canvasDraw.drawStuff();
      },

      mouseDownColor: function(e){
        mousePos = mouse(e);

        // change la couleur de l'item actif.
        var tableText = canvasControl.getTableText();
        tableText[drag.id].font.color = mousePos.color;

        // Dessine.
        canvasDraw.drawStuff();

        $rootScope.$emit('no-click-on-element');
      },
      
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
            // Met isSelect a l'objet en cours si ce n'est pas un deco.
            // Et enlève l'ancien sélectionner.
            // Redraw si nécessaire.
            if (olddragid !== drag.id && drag.type !== 'deco'){
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
            // qu'avant oui alors le désélectionner
            // et redessine.
            if (olddragid !== null){
              tabActive[olddragid].setSelected(false);


              // Enlève pop-up quand on deplace la souris hors zone
              //canvasControl.resetActiveItem();

              
              canvasDraw.drawStuff();
            }
            olddragid = null;
          }
        }

        // Si une boite existe.
        if (boite.titre !== undefined){

          // Selon la vue, on regarde si la souris est sur les corners ou les borders.
          switch(canvasSetting.viewState){

            case 'up':
              drag = checkCollision.checkMouseBorder(mousePos, [boite], 10);
              if (drag) {
                drag.type = 'borderboite';
                update(drag.pointer.type);
                return;
              }
              break;

            case 'left' :
              drag = checkCollision.checkMouseCorner(mousePos, [boite], 10, ['top-left']);
              if (drag) {
                drag.type = 'cornersideboite';
                update(drag.pointer.type);
                return;
              }
              drag = checkCollision.checkMouseBorder(mousePos, [boite], 10);
              if (drag && drag.pointer.pos !== 'top'){
                drag.type = 'borderboite';
                update(drag.pointer.type);
                return;
              }
              break;

            case 'right' :
              drag = checkCollision.checkMouseCorner(mousePos, [boite], 10, ['top-right']);
              if (drag) {
                drag.type = 'cornersideboite';
                update(drag.pointer.type);
                return;
              }
              drag = checkCollision.checkMouseBorder(mousePos, [boite], 10);
              if (drag && drag.pointer.pos !== 'top'){
                drag.type = 'borderboite';
                update(drag.pointer.type);
                return;
              }
              break;

            case 'top':
              break;

            case 'bottom':
              break;

            case 'down':
              break;

            default:
              return console.log('ERROR ' + canvasSetting.viewState + ' is not a valid state');
          }

          // Regarde si la souris est sur la boite
          drag = checkCollision.checkMouseBox(mousePos, [boite], 10);
          if(drag){
            drag.type = 'boite';
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
          case 'cornersideboite':
            $rootScope.$emit('click-on-corner-side-boite');
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

        // On verifie si l'item est selected.
        if (tabActive[drag.id].isSelected === true) {

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
        }
      },

      /**
       * En vue LEFT ou RIGHT, agrandi une seule hauteur par le coin.
       * @param e
       */
      mouseMouveCornerSideBoite: function(e){

        // Delais avant le drag
        timeb = (new Date()).getTime() - timea;
        if (timeb < DELAY_DRAG) {
          return;
        }

        mousePos = {x: e.layerX, y: e.layerY};

        var testProj = false;
        //var posMax = canvasControl.findGlobalRect();
        var masterBoite = canvasControl.getMasterBoite();
        var posMax = boite.findAllExtreme();

        var marginBoite = canvasControl.getBoite().margin;

        switch(canvasSetting.viewState){

          case 'left':
            // Coin haut-gauche.
            if (drag.pointer.type === 'nw-resize'){

              // La souris est plus haut que la marge.
              if (mousePos.y < canvasSetting.marginCanvas){
                mousePos.y = canvasSetting.marginCanvas;
              }

              // Regarde si pas inferieur au bord droit.
              if (mousePos.y > boite.points[1].y) {
                mousePos.y = boite.points[1].y;
              }

              // Regarde si pas inferieur a un composant ou a effet.
              if (mousePos.y > posMax.t - marginBoite) {
                mousePos.y = posMax.t - marginBoite;
              }

              // Regarde sur les autres projections si pas inférieur a un composant ou un effet.
              testProj = masterBoite.projectionsCollisionY(canvasSetting.viewState, mousePos, 0);
              if(testProj) {
                mousePos.y = boite.points[3].y - testProj;
              }

              // Redimensionne la boite.
              boite.points[0].setY(mousePos.y);
            }
            break;

          case 'right':
            // Coin haut-droit.
            if (drag.pointer.type === 'ne-resize'){

              // La souris est plus haut que la marge.
              if (mousePos.y < canvasSetting.marginCanvas){
                mousePos.y = canvasSetting.marginCanvas;
              }

              // Regarde si pas inferieur au bord gauche.
              if (mousePos.y > boite.points[0].y) {
                mousePos.y = boite.points[0].y;
              }

              // Regarde si pas inferieur a un composant ou a effet.
              if (mousePos.y > posMax.t - marginBoite) {
                mousePos.y = posMax.t - marginBoite;
              }

              // Regarde sur les autres projections si pas inférieur a un composant ou un effet.
              testProj = masterBoite.projectionsCollisionY(canvasSetting.viewState, mousePos, 1);
              if(testProj) {
                mousePos.y = boite.points[2].y - testProj;
              }

              // Redimensionne la boite.
              boite.points[1].setY(mousePos.y);
            }
            break;

          default:
            return console.log('ERROR ' + canvasSetting.viewState + ' is not a valid state. Only "left" or "right" allowed');
        }

        // Recalcule les positions de fleches entourant la boite.
        canvasControl.setArrowPos();
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

        var b1, b2;
        var limit = 50;

        // Delais avant le drag
        timeb = (new Date()).getTime() - timea;
        if (timeb < DELAY_DRAG) {
          return;
        }

        mousePos = {x: e.layerX, y: e.layerY};

        var testProj = false;
        //var posMax = canvasControl.findGlobalRect();
        var posMax = boite.findAllExtreme();
        var masterBoite = canvasControl.getMasterBoite();

        var marginBoite = canvasControl.getBoite().margin;

        limit = (canvasSetting.viewState === 'left' || canvasSetting.viewState === 'right') ? masterBoite.initialHeight : limit;

        // Bord haut ou bas.
        if (drag.pointer.type === 'ns-resize'){

          //Bord bas.
          if (drag.pointer.pos === 'bottom'){

            // Agrendit le canvas.
            if (mousePos.y > canvasSetting.canvas.height * 0.8) {
              canvasSetting.canvas.height = mousePos.y * 1.2;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mousePos.y < posMax.b + marginBoite) {
              mousePos.y = posMax.b + marginBoite;
            }

            // Regarde si pas inferieur à une taille minimale.
            // On determine le bord le plus court.
            b1 = boite.points[3].y - boite.points[0].y;
            b2 = boite.points[2].y - boite.points[1].y;
            if ( b1 <= b2 ) {
              if (mousePos.y < boite.points[0].y + limit) {
                mousePos.y = boite.points[0].y + limit;
              }
            }
            else {
              if (mousePos.y < boite.points[1].y + limit) {
                mousePos.y = boite.points[1].y + limit;
              }
            }

            // Regarde sur les autres projections si pas inférieur a un composant ou un effet.
            testProj = masterBoite.projectionsCollisionY(canvasSetting.viewState, mousePos, 3);
            if(testProj) {
              if (canvasSetting.viewState === 'right') {
                mousePos.y = boite.points[1].y + testProj;
              }
              else {
                mousePos.y = boite.points[0].y + testProj;
              }
            }

            // Redimensionne la boite.
            boite.points[2].setY(mousePos.y);
            boite.points[3].setY(mousePos.y);
          }
          //Bord haut.
          else {
            // La souris est plus haut que la marge.
            if (mousePos.y < canvasSetting.marginCanvas){
              mousePos.y = canvasSetting.marginCanvas;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mousePos.y > posMax.t - marginBoite) {
              mousePos.y = posMax.t - marginBoite;
            }

            // Regarde sur les autres projections si pas inférieur a un composant ou un effet.
            testProj = masterBoite.projectionsCollisionY(canvasSetting.viewState, mousePos, 0);
            if(testProj) {
              mousePos.y = boite.points[3].y - testProj;
              //mousePos.x = boite.points[1].x;
            }

            // Redimensionne la boite.
            boite.points[0].setY(mousePos.y);
            boite.points[1].setY(mousePos.y);
          }
        }
        // Bord gauche ou droite.
        else {
          // Bord droit.
          if (drag.pointer.pos === 'right') {

            // Regarde si pas inferieur a un composant ou a effet.
            if (mousePos.x < posMax.r + marginBoite) {
              mousePos.x = posMax.r + marginBoite;
            }

            // Regarde sur les autres projections si pas inférieur a un composant ou un effet.
            testProj = masterBoite.projectionsCollisionX(canvasSetting.viewState, mousePos, 1);
            if(testProj) {
              mousePos.x = boite.points[0].x + testProj;
              //mousePos.x = boite.points[1].x;
            }

            // Redimensionne la boite.
            boite.points[1].setX(mousePos.x);
            boite.points[2].setX(mousePos.x);
            //boite.size.w += mousePos.x - boite.getRight();

            // Agrendit le canvas.
            if (mousePos.x > canvasSetting.canvas.width  * 0.8) {
              canvasSetting.canvas.width = mousePos.x * 1.2;
            }

          }
          //Bord gauche.
          else {
            // La souris est plus à gauche que la marge.
            if (mousePos.x < canvasSetting.marginCanvas) {
              mousePos.x = canvasSetting.marginCanvas;
            }

            // Regarde si pas inferieur a un composant ou a effet.
            if (mousePos.x > posMax.l - marginBoite) {
              mousePos.x = posMax.l - marginBoite;
            }

            // Regarde sur les autres projections si pas inférieur a un composant ou un effet.
            testProj = masterBoite.projectionsCollisionX(canvasSetting.viewState, mousePos, 0);
            if(testProj) {
              mousePos.x = boite.points[1].x - testProj;
              //mousePos.x = boite.points[0].x;
            }

            // Redimensionne la boite.
            boite.points[0].setX(mousePos.x);
            boite.points[3].setX(mousePos.x);


            // Redimensionne la boite.
            //boite.size.w += boite.getLeft() - mousePos.x;
            //boite.setX(mousePos.x);
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

        // Met le bon pointeur de souris
        update('move');

        var delta = {x: boite.points[0].x, y: boite.points[0].y};
        // Deplace la boite.
        boite.move({x: e.layerX - mousePos.x, y: e.layerY - mousePos.y});

        // Deplace la boite si elle depasse depasse le canvas.
        boite.moveCloseBorder(canvasSetting.canvas, canvasSetting.marginCanvas);

        // Bouge les effets et les compos.
        delta = {x: boite.points[0].x - delta.x, y: boite.points[0].y - delta.y};
        boite.moveEffetCompo(delta);

        // Recalcule les positions de fleches entourant la boite.
        canvasControl.setArrowPos();

        // Dessine.
        canvasDraw.drawStuff();

        mousePos = {x: e.layerX, y: e.layerY};
      },

      /**
       * On deplace un obj
       */
      mouseMoveThing: function(e) {

        var masterBoite = canvasControl.getMasterBoite();

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
        tabActive[drag.id].moveCloseBorder(canvasSetting.canvas, canvasSetting.marginCanvas, boite.margin);

        // Bouge les composants si non debraillable.
        if (!canvasSetting.debrayable) {
          tabActive[drag.id].resetCompPos();
        }

        // Check les collisions entre l'item déplacé et la table active.
        checkCollision.check(tabActive[drag.id], tabActive);
        // Check l'alignement des things.
        canvasControl.setTableAlignLine(checkCollision.checkLine(tabActive[drag.id], tabActive));
        // Redimensionne la boite.
        masterBoite.checkBorderBoite(canvasSetting.viewState, tabActive[drag.id]);
        // Recalcule les positions de fleches entourant la boite.
        canvasControl.setArrowPos();
        // Dessine.
        canvasDraw.drawStuff();
      },


      /**
       * Mouse up par default.
       * Listener est bindé par défault dans le controleur table-dessin.
       * Désactivé au profit de MouseUp si un emit est créé par mouseDown.
       *
       */
      mouseUpDefault: function (e){

        // Verifier si on click ou si on draggue.
        timeb = (new Date()).getTime() - timea;

        // Si click, on enleve les selects et on redessine.
        if (timeb < DELAY_CLICK){
          canvasControl.resetIsSelected(tabActive);
          canvasDraw.drawStuff();
        }
      },

      /**
       * Mouse up.
       */
      mouseUp: function (e) {

        // Verifier si on click ou si on draggue pour l'affichage des pop-up.
        timeb = (new Date()).getTime() - timea;

        // Si oui, on annule le isSelected.
        if (timeb < DELAY_CLICK) {
          canvasControl.resetIsSelected(tabActive);
        }

        // Si oui on click.
        if (timeb < DELAY_CLICK && drag.type !=='boite' && tabActive[drag.id]){
          canvasControl.setActiveItem(tabActive[drag.id]);
          if (drag.type === 'deco'){
            tabActive[drag.id].setSelected(true);
          }
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
