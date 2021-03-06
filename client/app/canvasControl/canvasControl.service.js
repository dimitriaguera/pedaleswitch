'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasControl', function (canvasGlobalServ, canvasGeneration, canvasConversion, checkCollision) {

    var canvasGlobal = canvasGlobalServ.getCanvasGlobal();

    // Service logic.
    var boite = canvasGlobalServ.getBoite();
    var canvasS = canvasGlobalServ.getCanvasS();
    var tables = canvasGlobalServ.getTables();

    var thing = function(entity) {
      switch (entity.itemInfo.shape){
        case 'Rect':
          return canvasGeneration.newRect(entity);
        case 'Cercle':
          return canvasGeneration.newCercle(entity);
        case 'Poly':
          return canvasGeneration.newPoly(entity);
        default:
          console.log('Shape not match in canvasControl :' + entity.shape);
          return false;
      }
    };
    
    // Public API here
    return{

      /**
       * Creation de points.
       *
       */
      newPoint: function(point){
        return canvasGeneration.newPoint(point);
      },

      /**
       * Cette fonction créé les objets du canvas à partir de la selection.
       *
       * @param effet : objet effet dans la selection (entrée de la table selection de canvasGlobal).
       * @para bol : si true alors rajoute l'effet meme si il est deja dans le canvas
       *             sert au fonction de chargement depuis la db ou localstorage.
       * @para pos : met l'effet à la position donnée par pos.
       */
      addToCanvas: function(effet, bol, pos) {
        bol = bol || false;
        pos = pos || null;

        // Rajouter a l'effet dans quelle vue il a été ajouté.
        effet.projSide = (!effet.projSide) ? canvasGlobal.state.viewState : effet.projSide ;
        effet.label = (!effet.label) ? 'Effet' : effet.label ;

        // check si l'effet est deja dans le canvas.
        if (!effet.inCanvas || bol) {
          var tmpEff = canvasGeneration.newRect(effet);
          var compos = effet.composants;
          var tmpComp;

          if (pos){
            tmpEff.moveTo(pos);
            if (canvasGlobalServ.getDeb()){
              tmpEff.resetCompPos();
            }
          }

          // Créer le boitier de la pedale si il n'existe pas.
          if(boite.projBoite.fonction !== 'Boite') {
            canvasGlobalServ.setMasterBoite(canvasGeneration.newMasterBoite(tmpEff));

            // Créer les projections de la boite.
            boite.masterBoite.createProjection();

            // On sélectionne la bonne projection.
            canvasGlobalServ.setProjBoite(boite.masterBoite.projections[canvasGlobal.state.viewState]);

            // Empeche que l'effet depasse du canvas.
            tmpEff.moveCloseBorder(canvasS.canvas, canvasS.marginCanvas, boite.projBoite.margin);

            // Initialise la position de la boite.
            boite.projBoite.initMoveBox(tmpEff);

            // Créer les flèches autour de la boite.
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'right'));
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'bottom'));
          }
          else {
            // Empeche que l'effet depasse du canvas.
            tmpEff.moveCloseBorder(canvasS.canvas, canvasS.marginCanvas, boite.projBoite.margin);

            // Redimensionne la boite si le nouvelle effet est en dehors.
            boite.masterBoite.checkBorderBoite(canvasGlobal.state.viewState, tmpEff);

            // Repositionne les arrow.
            this.setArrowPos();
          }

          // Met le nouvel effet dans la bonne projection.
          boite.masterBoite.projections[canvasGlobal.state.viewState].effets.push(tmpEff);

          // On créé les composants.
          for (var i = 0; i < compos.length; i++) {
            compos[i].label = (compos[i].label) ? 'Composant' : compos[i].label;
            tmpComp = thing(compos[i]);
            tmpEff.composants.push(tmpComp);
            boite.masterBoite.projections[canvasGlobal.state.viewState].composants.push(tmpComp);
          }

          // Place bien les composants.
          if (!effet.inCanvas) {
            tmpEff.resetCompPos();
          }

          // Rajoute la propriété inCanvas a l'effet.
          tmpEff.inCanvas = true;

          // Empeche que l'effet depasse du canvas.
          tmpEff.moveCloseBorder(canvasS.canvas, canvasS.marginCanvas, boite.projBoite.margin);

          // Check les collisions entre tout les obj.
          checkCollision.checkAll(boite.masterBoite.projections[canvasGlobal.state.viewState].effets);

          // Créé les limites des projections.
          boite.masterBoite.createProjectionsLimits(canvasGlobal.state.viewState);

          // Update de la selection.
          canvasGlobalServ.affectEffetInSelections(tmpEff);

          canvasGlobalServ.autoSetTableActive();

          this.canvasDrawState(canvasGlobal.state.isActive);

          return tmpEff;
        }
      },

      /**
       * Enlève l'effet du canvas.
       * @param effet
       */
      removeToCanvas: function(effet) {
        // Pour la bonne projection de table.
        var index = canvasGlobalServ.searchTabByIdReturnIndex(boite.masterBoite.projections[effet.projSide].effets, effet._id, effet.key);
        if (index !== false) {
          effet.inCanvas = false;
          var removeIndex = [];
          for (var i = 0  ; i < boite.masterBoite.projections[effet.projSide].composants.length ; i++) {
            if (effet.key === boite.masterBoite.projections[effet.projSide].composants[i].key) {
              removeIndex.push(i);
            }
          }
          for (i = removeIndex.length -1; i >= 0; i--){
            boite.masterBoite.projections[effet.projSide].composants.splice(removeIndex[i],1);
          }
          boite.masterBoite.projections[effet.projSide].effets.splice(index,1);
        }

      },

      /**
       * Ajoute du textDeco au canvas.
       * @param string
       */
      addTextToCanvas: function(strOrObj) {
        var texte;

        texte = canvasGeneration.newTexte(strOrObj);

        if (typeof strOrObj === 'string'){
          texte.moveTo(boite.masterBoite.projections[canvasGlobal.state.viewState].getCenter());
        }

        // Rajoute à la prjBoite le texte.
        boite.masterBoite.projections[canvasGlobal.state.viewState].textDeco.push(texte);

        // Rajoute le texte à la table texte.
        tables.tableTextDeco.push(texte);

        // Load automatiquement la font depuis google font.
        // @todo a vérifier car assume que toute font vient de google.
        // de plus police par défaut est lato qui est pas dl des le debut donc changement de police
        // au milieu
        var test = texte.font.family;
        test = test.replace(/"/g,'');
        test = test.split(',');
        if (test.slice(-1)[0].indexOf('google') >= 0) {
          test.pop();
          WebFont.load({
            google: {
              families: [test[0] + ':' + test[1].replace(/ /g,'')]
            }
          });
        }


      },

      /**
       * Enlève du textDeco au canvas
       * @param index
       */
      removeTextToCanvas: function(index){
        boite.projBoite.textDeco.splice(index,1);
        tables.tableTextDeco.splice(index,1);
      },

      /**
       * Ajouter une shapeDeco au canvas
       */
      addShapeToCanvas: function(obj){
        var shape;
        obj.fonction = 'deco';
        switch (obj.shape){
          case 'Rectangle':
            obj.label = 'Forme Rectangle';
            shape = new canvasGeneration.newRect(obj);
            break;
          case 'Cercle':
            obj.label = 'Forme Ellipse';
            shape = new canvasGeneration.newCercle(obj);
            break;
          default:
            obj.label = 'Forme Rectangle';
            shape = new canvasGeneration.newRect(obj);
        }

        shape.moveTo(boite.masterBoite.projections[canvasGlobal.state.viewState].getCenter());

        // Rajoute à la prjBoite
        boite.masterBoite.projections[canvasGlobal.state.viewState].shapeDeco.push(shape);

        // Rajoute à la table.
        tables.tableShapeDeco.push(shape);

      },

      /**
       * Enlève une shapeDeco au canvas
       * @param index
       */
      removeShapeToCanvas: function(index){
        boite.projBoite.shapeDeco.splice(index,1);
        tables.tableShapeDeco.splice(index,1);
      },

      /**
       * Ajout d'image au canvas
       */
      addImgToCanvas: function(src){
        var canvasGeneration2 = canvasGeneration,
            canvasGlobal2 = canvasGlobal,
            img = new Image(),
            boite2 = boite;

        if (src) {
          img.src = src;
        } else {
          img.src = 'assets/images/yeoman2.png';
          // return;
        }


        img.onload = function(){
          var boiteSize = boite2.projBoite.findExtreme().size;

          var ratio = img.width/img.height;

          if (img.height > boiteSize.h){
            img.height = boiteSize.h;
            img.width = img.height * ratio;
            if (img.width > boiteSize.w){
              img.width = boiteSize.w;
              img.height = img.width / ratio;
            }

          }
          else{
            if (img.width > boiteSize.w){
              img.width = boiteSize.w;
              img.height = img.width / ratio;
              if(img.height > boiteSize.h){
                img.height = boiteSize.h;
                img.width = img.height * ratio;
              }
            }
          }

          var points = [
            {x:0,y:0},
            {x:img.width,y:0},
            {x:img.width,y:img.height},
            {x:0,y:img.height}
          ];
          var tmpImg = canvasGeneration2.newImgDeco({img:img,points:points,fonction:'deco'});
          var translate = boite.masterBoite.projections[canvasGlobal.state.viewState].getCenter();
          translate.x -= img.width/2;
          translate.y -= img.height/2;
          tmpImg.move(translate);
          boite2.projBoite.imgDeco.push(tmpImg);
          canvasGlobal2.tables.tableImgDeco.push(tmpImg);
          tmpImg.drawCanvas(canvasGlobal2.canvas.ctx);
        }
      },

      /**
       * Enlève une imgDeco au canvas
       * @param index
       */
      removeImgToCanvas: function(index) {
        boite.projBoite.imgDeco.splice(index,1);
        tables.tableImgDeco.splice(index,1);
      },

      /**
       * Réorganise les tables maîtres canvas selon l'état passé en argument.
       *
       * @param state : string - 'top', 'bottom', 'up', 'down', 'left', 'right'
       */
      canvasViewState: function (state) {
        boite.masterBoite.updateMaster(canvasGlobal.state.viewState);
        switch (state) {
          case 'top':
            canvasGlobalServ.setViewState('top');
            boite.masterBoite.updateProjection(canvasGlobal.state.viewState);
            boite.masterBoite.createProjectionsLimits(canvasGlobal.state.viewState);
            boite.masterBoite.projections[canvasGlobal.state.viewState].moveToCenterWindow(canvasGlobal);
            canvasGlobalServ.resetAll();
            canvasGlobalServ.setProjBoite(boite.masterBoite.projections.top);
            canvasGlobalServ.setTableTextDeco(boite.masterBoite.projections.top.textDeco);
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'right'));
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'bottom'));
            break;
          case 'bottom':
            canvasGlobalServ.setViewState('bottom');
            boite.masterBoite.updateProjection(canvasGlobal.state.viewState);
            boite.masterBoite.createProjectionsLimits(canvasGlobal.state.viewState);
            boite.masterBoite.projections[canvasGlobal.state.viewState].moveToCenterWindow(canvasGlobal);
            canvasGlobalServ.resetAll();
            canvasGlobalServ.setProjBoite(boite.masterBoite.projections.bottom);
            canvasGlobalServ.setTableTextDeco(boite.masterBoite.projections.bottom.textDeco);
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'right'));
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'bottom'));
            break;
          case 'up':
            canvasGlobalServ.setViewState('up');
            boite.masterBoite.updateProjection(canvasGlobal.state.viewState);
            boite.masterBoite.createProjectionsLimits(canvasGlobal.state.viewState);
            boite.masterBoite.projections[canvasGlobal.state.viewState].moveToCenterWindow(canvasGlobal);
            canvasGlobalServ.resetAll();
            canvasGlobalServ.setProjBoite(boite.masterBoite.projections.up);
            canvasGlobalServ.setTableTextDeco(boite.masterBoite.projections.up.textDeco);
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'right'));
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'bottom'));

            //@todo : table de travail, a supprimer.
            //this.setTableDrawLimits([masterBoite.projections.left, masterBoite.projections.right]);
            //this.setTableDrawDashed([masterBoite.projections.left, masterBoite.projections.right]);

            break;
          case 'down':
            canvasGlobalServ.setViewState('down');
            boite.masterBoite.updateProjection(canvasGlobal.state.viewState);
            boite.masterBoite.createProjectionsLimits(canvasGlobal.state.viewState);
            boite.masterBoite.projections[canvasGlobal.state.viewState].moveToCenterWindow(canvasGlobal);
            canvasGlobalServ.resetAll();
            canvasGlobalServ.setProjBoite(boite.masterBoite.projections.down);
            canvasGlobalServ.setTableTextDeco(boite.masterBoite.projections.down.textDeco);
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'right'));
            tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'bottom'));
            break;
          case 'left':
            canvasGlobalServ.setViewState('left');
            boite.masterBoite.updateProjection(canvasGlobal.state.viewState);
            boite.masterBoite.createProjectionsLimits(canvasGlobal.state.viewState);
            boite.masterBoite.projections[canvasGlobal.state.viewState].moveToCenterWindow(canvasGlobal);
            canvasGlobalServ.resetAll();
            canvasGlobalServ.setProjBoite(boite.masterBoite.projections.left);
            canvasGlobalServ.setTableTextDeco(boite.masterBoite.projections.left.textDeco);
            tables.tableArrow.push(canvasGeneration.newArrowPoint(boite.projBoite, 'right'));
            tables.tableArrow.push(canvasGeneration.newArrowPoint(boite.projBoite, 'bottom'));
            break;
          case 'right':
            canvasGlobalServ.setViewState('right');
            boite.masterBoite.updateProjection(canvasGlobal.state.viewState);
            boite.masterBoite.createProjectionsLimits(canvasGlobal.state.viewState);
            boite.masterBoite.projections[canvasGlobal.state.viewState].moveToCenterWindow(canvasGlobal);
            canvasGlobalServ.resetAll();
            canvasGlobalServ.setProjBoite(boite.masterBoite.projections.right);
            canvasGlobalServ.setTableTextDeco(boite.masterBoite.projections.right.textDeco);
            tables.tableArrow.push(canvasGeneration.newArrowPoint(boite.projBoite, 'right'));
            tables.tableArrow.push(canvasGeneration.newArrowPoint(boite.projBoite, 'bottom'));
            break;
          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      },

      /**
       * Réorganise les tables esclaves canvas selon l'état passé en argument.
       *
       * @param state : string - 'effet', 'composant'
       * @return true si effet dans le canvas, false si canvas vide.
       */
      canvasDrawState: function (state) {

        var active, inactive;

        switch(state) {

          case 'effet':
            active = boite.projBoite.effets;
            inactive = boite.projBoite.composants;
            canvasGlobalServ.resetIsSelected(active);
            canvasGlobalServ.resetIsSelected(inactive);
            canvasGlobalServ.resetTableDrawDashed();
            canvasGlobalServ.setTableActive(active);
            canvasGlobalServ.setTableDrawThin(inactive);
            return (active.length > 0);

          case 'composant':
            active = boite.projBoite.composants;
            inactive = boite.projBoite.effets;
            canvasGlobalServ.resetIsSelected(active);
            canvasGlobalServ.resetIsSelected(inactive);
            canvasGlobalServ.resetTableDrawThin();
            canvasGlobalServ.setTableActive(active);
            canvasGlobalServ.setTableDrawDashed(inactive);
            return (active.length > 0);

          case 'deco':
            canvasGlobalServ.resetIsSelected(boite.projBoite.composants);
            canvasGlobalServ.resetIsSelected(boite.projBoite.effets);
            canvasGlobalServ.resetTableDrawDashed();
            canvasGlobalServ.resetTableDrawThin();
            canvasGlobalServ.setTableActive([]);
            canvasGlobalServ.setTableDrawThin(boite.projBoite.composants);
            return (tables.tableTextDeco.length > 0);
          
          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      },

      /**
       * Restaure un canvas a partir d'une instance de Dessin.
       * 
       * @param dessin
       */
      restoreCanvas: function(saveData){
        var i,j, oldViewState = canvasGlobal.state.viewSate;
        var viewPossible = ['bottom','down','left','right','top','up'];

        // Regénère la masterboite.
        canvasGlobalServ.setMasterBoite(canvasGeneration.newMasterBoite(saveData.boite.masterBoite));

        // Regénére les points des projections de boite.
        var projPoints = {};
        for (i = 0 ; i < viewPossible.length ; i++) {
          projPoints[viewPossible[i]] = {points: []};
          for (j = 0; j < saveData.boite.masterBoite.projections[viewPossible[i]].points.length; j++) {
            projPoints[viewPossible[i]].points[j] = {};
            projPoints[viewPossible[i]].points[j].x = saveData.boite.masterBoite.projections[viewPossible[i]].points[j].x;
            projPoints[viewPossible[i]].points[j].y = saveData.boite.masterBoite.projections[viewPossible[i]].points[j].y;
          }
        }

        // Créer les projections de la boite avec les bon points.
        boite.masterBoite.createProjection(projPoints);

        // Va rajouter les effets, les composants, les deco au bonne projections de boites.
        for (i = 0 ; i < viewPossible.length ; i++){
          canvasGlobal.state.viewState = viewPossible[i];
          canvasGlobalServ.setProjBoite(boite.masterBoite.projections[viewPossible[i]]);

          // Va rajouter les effets, les composants
          for (j = 0 ; j < saveData.boite.masterBoite.projections[viewPossible[i]].effets.length ; j++) {
            this.addToCanvas(saveData.boite.masterBoite.projections[viewPossible[i]].effets[j], true);
          }

          // Rajoute la couleur à la boite.
          canvasGlobal.boite.projBoite.color = saveData.boite.masterBoite.projections[viewPossible[i]].color;

          // Va rajouter les textDeco
          for (j = 0 ; j < saveData.boite.masterBoite.projections[viewPossible[i]].textDeco.length ; j++) {
            this.addTextToCanvas(saveData.boite.masterBoite.projections[viewPossible[i]].textDeco[j]);
          }


          // // Va rajouter les imgDeco
          // for (j = 0 ; j < saveData.boite.masterBoite.projections[viewPossible[i]].imgDeco.length ; j++) {
          //   this.addToCanvas(saveData.boite.masterBoite.projections[viewPossible[i]].imgDeco[j], true);
          // }
          //
          // // Va rajouter les shapeDeco
          // for (j = 0 ; j < saveData.boite.masterBoite.projections[viewPossible[i]].shapeDeco.length ; j++) {
          //   this.addToCanvas(saveData.boite.masterBoite.projections[viewPossible[i]].shapeDeco[j], true);
          // }



        }




        // On sélectionne la bonne projection.
        canvasGlobal.state.viewSate = oldViewState;
        canvasGlobalServ.setProjBoite(boite.masterBoite.projections[canvasGlobal.state.viewState]);


        // Remet les flèches.
        tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'right'));
        tables.tableArrow.push(canvasGeneration.newArrow(boite.projBoite, 'bottom'));
      },

      /**
       * Retourne la taille du canvas.
       * @returns {{w: (number|*), h: *}}
       */
      getCanvasSize: function () {
        return {
          w: canvasS.canvas.width,
          h: canvasS.canvas.height
        };
      },

      /**
       * Retourne la taille du conteneur du canvas.
       * @returns {{w: (number|*), h: *}}
       */
      getCanvasWindowSize: function () {
        return {
          w: canvasS.canvasWindow.width(),
          h: canvasS.canvasWindow.height()
        };
      },


      /**
       * Agrandit/reduit le canvas pour qu'il soit au moins aussi grand que la boite ou que le conteneur du canvas.
       */
      resizeCanvas: function(){

        var canvasWindow = this.getCanvasWindowSize();
        var w = canvasWindow.w,
            h = canvasWindow.h;

        if (boite.projBoite.fonction === 'Boite') {

          var realmargin = 150;
          var posExt = boite.projBoite.findExtreme();

          // Test droite.
          w = Math.max((posExt.r + realmargin), w);

          // Test bas.
          h = Math.max((posExt.b + realmargin), h);
        }

        canvasS.canvas.width = w;
        canvasS.canvas.height = h;
      },

      zoomChange: function(value){
        var okZoom = canvasConversion.setZoom(value);
        if (okZoom) {
          canvasConversion.convertEffetZoom(boite.masterBoite);
          for (var i = 0; i < canvasGlobal.selections.length; i++) {
            canvasConversion.convertEffetZoom(canvasGlobal.selections[i]);
          }
        }
        return okZoom;
      },

      /**
       * Centre les élements dans le canvas.
       */
      centerInCanvas: function() {
        if (boite.projBoite.points) {
          boite.projBoite.moveToCenterWindow(canvasGlobal);
        }
      },

      /**
       * Redimentionne la boite si l'entity depasse.
       * Si l'entity est un effet ou un composant.
       * @param entity
       */
      checkBorderBoxRotate: function(entity){
        if (entity.fonction === 'Effet') {
          boite.masterBoite.checkBorderBoite(canvasGlobal.state.viewState, entity);
          var vect = boite.projBoite.moveCloseBorder(canvasS.canvas, canvasS.marginCanvas);
          boite.projBoite.moveEffetCompoDeco(vect);
        }
      },


      /**
       * Affecte une position aux flèches.
       */
      //@todo optimisation possible check arraw active.
      setArrowPos: function(){
        for(var i = 0; i < tables.tableArrow.length; i++){
          tables.tableArrow[i].setPos(tables.tableArrow[i].loc);
        }
      },

      /**
       * Remet la position des composants à sa valeur par défaut.
       * Cas quand on passe de debrayable a non debrayable.
       *
       * @param value
       */
      resetCompPos: function(value){
        if (!value) {
          for (var i = 0; i < boite.projBoite.effets.length; i++) {
            boite.projBoite.effets[i].resetCompPos();
          }
        }
      },

      /**
       * Change un composant dans le canvas.
       * Par exemple l'utilisateur choisie un led carré au lieu d'une ronde.
       * @todo cette fonction reste la car il faut aussi modifier selections.
       * @param compo
       */
      updateComposantInCanvas: function(compo){
        var effet = canvasGlobalServ.searchEffetByKey(compo.key);
        if (effet) {
          var indexEffet = canvasGlobalServ.searchTabByIdReturnIndex(boite.projBoite.effets, effet._id, effet.key);
          var indexEffetCompo = canvasGlobalServ.searchTabByIdReturnIndex(boite.projBoite.effets[indexEffet].composants, compo._id, compo.key);
          var indexCompo = canvasGlobalServ.searchTabByIdReturnIndex(boite.projBoite.composants, compo._id, compo.key);
          // On genere une nouveau composant.
          // On met à jour le shapeObject.
          boite.projBoite.effets[indexEffet].composants[indexEffetCompo] = boite.projBoite.composants[indexCompo] = thing(compo);
          boite.projBoite.effets[indexEffet].composants[indexEffetCompo].changeShape();
        }
      },



    };
  });
