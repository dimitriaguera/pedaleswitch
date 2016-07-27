'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasControl', function (canvasGeneration, canvasConversion, checkCollision, rulers) {
    // Service logic

    var boite = {};
    var masterBoite = {};

    var canvasSetting = {
      ctx: {},
      canvas: {},
      canvasWindow: {},
      marginCanvas: canvasConversion.convertToPixel(40),
      debrayable: false,
      viewState: 'up',
      isActive: 'effet'
    };

    var tableEffet = [];
    var tableComposant = [];
    var tableActive = [];
    var tableDrawDashed = [];
    var tableDrawThin = [];
    var tableDrawShine = [];
    var tableAlignLine = [];
    var tableText = [];
    var tableArrow = [];
    var activeItem = [];

    // @todo a supprimer, table de travail.
    var tableDrawLimits = [];
    // Fin todo
    
    //var marginCanvas = canvasConversion.convertToPixel(40);
    
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
       * Cette fonction créé les objets du canvas à partir du modèle dessin.
       * Et l'ajoute dans tableEffet et tableComposant pour les composants correspondants.
       *
       * @param effet : objet effet du modele dessin (entrée de la table option du panier).
       * @para bol : si true alors rajoute l'effet meme si il est deja dans le canvas
       *             sert au fonction de chargement depuis la db ou localstorage.
       * @para pos : met l'effet à la position donnée par pos.
       */
      addToCanvas: function(effet, bol, pos) {
        bol = bol || false;
        pos = pos || null;

        // if check si l'effet est deja dans le canvas.
        if (!effet.inCanvas || bol) {
          var tmpEff = canvasGeneration.newRect(effet);
          var compos = effet.composants;
          var tmpComp;

          if (pos){
            tmpEff.moveTo(pos);
            if (canvasSetting.debrayable){
              tmpEff.resetCompPos();
            }
          }

          // Créer le boitier de la pedale.
          if(boite.fonction !== 'Boite') {
            this.setMasterBoite(canvasGeneration.newMasterBoite(tmpEff));

            // Créer les projections de la boite.
            masterBoite.createProjection();

            // On sélectionne la bonne projection.
            this.setBoite(masterBoite.projections[canvasSetting.viewState]);

            // Empeche que l'effet depasse du canvas.
            tmpEff.moveCloseBorder(canvasSetting.canvas, canvasSetting.marginCanvas, boite.margin);

            // Initialise la position de la boite.
            boite.initMoveBox(tmpEff);

            
            // Créer les flèches autour de la boite.
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
          }
          else {
            // Empeche que l'effet depasse du canvas.
            tmpEff.moveCloseBorder(canvasSetting.canvas, canvasSetting.marginCanvas, boite.margin);

            // Redimensionne la boite si le nouvelle effet est en dehors.
            masterBoite.checkBorderBoite(canvasSetting.viewState, tmpEff);

            // Repositionne les arraw.
            this.setArrowPos();
          }

          // Lie les effets et composants a la bonne projection de la boite.
          masterBoite.projections[canvasSetting.viewState].effets.push(tmpEff);

          // On créé les composants.
          for (var i = 0; i < compos.length; i++) {
            tmpComp = thing(compos[i]);
            tableComposant.push(tmpComp);
            tmpEff.composants.push(tmpComp);
            masterBoite.projections[canvasSetting.viewState].composants.push(tmpComp);
          }

          // Place bien les composants.
          if (!effet.inCanvas) {
            tmpEff.resetCompPos();
          }

          // Rajoute la propriété inCanvas a l'effet.
          effet.inCanvas = true;

          // Rajoute l'effet a la table effet et le master dans la table MesterEffet.
          tableEffet.push(tmpEff);

          // Empeche que l'effet depasse du canvas.
          tmpEff.moveCloseBorder(canvasSetting.canvas, canvasSetting.marginCanvas, boite.margin);

          // Check les collisions entre tout les obj.
          checkCollision.checkAll(tableEffet);

          // Créé les limites des projections.
          masterBoite.createProjectionsLimits(canvasSetting.viewState);

          return tmpEff;
        }
      },

      /**
       * Enlève l'effet du canvas.
       * @param effet
       */
      removeToCanvas: function(effet) {
        var index = this.searchTabByIdReturnIndex(tableEffet, effet._id, effet.key);
        if(index !== false){
          effet.inCanvas = false;
          var removeIndex = [];
          for (var i = 0  ; i < tableComposant.length ; i++) {
            if (effet.key === tableComposant[i].key) {
              removeIndex.push(i);
            }
          }
          for (i = removeIndex.length -1; i >= 0; i--){
            tableComposant.splice(removeIndex[i],1);
          }
          tableEffet.splice(index,1);
        }
      },


      /**
       * Réorganise les tables maîtres canvas selon l'état passé en argument.
       *
       * @param state : string - 'top', 'bottom', 'up', 'down', 'left', 'right'
       */
      canvasViewState: function (state) {

        masterBoite.updateMaster(canvasSetting.viewState);
        switch (state) {
          case 'top':
            this.setViewState('top');
            masterBoite.updateProjection(canvasSetting.viewState);
            masterBoite.createProjectionsLimits(canvasSetting.viewState);
            masterBoite.projections[canvasSetting.viewState].moveToCenterWindow(canvasSetting);
            this.resetAll();
            this.setBoite(masterBoite.projections.top);
            this.setTableEffet(masterBoite.projections.top.effets);
            this.setTableComposant(masterBoite.projections.top.composants);
            this.setTableText(masterBoite.projections.top.textDeco);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            break;
          case 'bottom':
            this.setViewState('bottom');
            masterBoite.updateProjection(canvasSetting.viewState);
            masterBoite.createProjectionsLimits(canvasSetting.viewState);
            masterBoite.projections[canvasSetting.viewState].moveToCenterWindow(canvasSetting);
            this.resetAll();
            this.setBoite(masterBoite.projections.bottom);
            this.setTableEffet(masterBoite.projections.bottom.effets);
            this.setTableComposant(masterBoite.projections.bottom.composants);
            this.setTableText(masterBoite.projections.bottom.textDeco);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            break;
          case 'up':
            this.setViewState('up');
            masterBoite.updateProjection(canvasSetting.viewState);
            masterBoite.createProjectionsLimits(canvasSetting.viewState);
            masterBoite.projections[canvasSetting.viewState].moveToCenterWindow(canvasSetting);
            this.resetAll();
            this.setBoite(masterBoite.projections.up);
            this.setTableEffet(masterBoite.projections.up.effets);
            this.setTableComposant(masterBoite.projections.up.composants);
            this.setTableText(masterBoite.projections.up.textDeco);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));

            //@todo : table de travail, a supprimer.
            //this.setTableDrawLimits([masterBoite.projections.left, masterBoite.projections.right]);
            //this.setTableDrawDashed([masterBoite.projections.left, masterBoite.projections.right]);

            break;
          case 'down':
            this.setViewState('down');
            masterBoite.updateProjection(canvasSetting.viewState);
            masterBoite.createProjectionsLimits(canvasSetting.viewState);
            masterBoite.projections[canvasSetting.viewState].moveToCenterWindow(canvasSetting);
            this.resetAll();
            this.setBoite(masterBoite.projections.down);
            this.setTableEffet(masterBoite.projections.down.effets);
            this.setTableComposant(masterBoite.projections.down.composants);
            this.setTableText(masterBoite.projections.down.textDeco);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            break;
          case 'left':
            this.setViewState('left');
            masterBoite.updateProjection(canvasSetting.viewState);
            masterBoite.createProjectionsLimits(canvasSetting.viewState);
            masterBoite.projections[canvasSetting.viewState].moveToCenterWindow(canvasSetting);
            this.resetAll();
            this.setBoite(masterBoite.projections.left);
            this.setTableEffet(masterBoite.projections.left.effets);
            this.setTableComposant(masterBoite.projections.left.composants);
            this.setTableText(masterBoite.projections.left.textDeco);
            tableArrow.push(canvasGeneration.newArrowPoint(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrowPoint(boite, 'bottom'));
            break;
          case 'right':
            this.setViewState('right');
            masterBoite.updateProjection(canvasSetting.viewState);
            masterBoite.createProjectionsLimits(canvasSetting.viewState);
            masterBoite.projections[canvasSetting.viewState].moveToCenterWindow(canvasSetting);
            this.resetAll();
            this.setBoite(masterBoite.projections.right);
            this.setTableEffet(masterBoite.projections.right.effets);
            this.setTableComposant(masterBoite.projections.right.composants);
            this.setTableText(masterBoite.projections.right.textDeco);
            tableArrow.push(canvasGeneration.newArrowPoint(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrowPoint(boite, 'bottom'));
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
            active = tableEffet;
            inactive = tableComposant;
            this.resetIsSelected(active);
            this.resetIsSelected(inactive);
            this.resetTableDrawDashed();
            this.setTableActive(active);
            this.setTableDrawThin(inactive);
            return (active.length > 0);

          case 'composant':
            active = tableComposant;
            inactive = tableEffet;
            this.resetIsSelected(active);
            this.resetIsSelected(inactive);
            this.resetTableDrawThin();
            this.setTableActive(active);
            this.setTableDrawDashed(inactive);
            return (active.length > 0);

          case 'deco':
            this.resetIsSelected(tableComposant);
            this.resetIsSelected(tableEffet);
            this.resetTableDrawDashed();
            this.resetTableDrawThin();
            this.setTableActive(tableText);
            this.setTableDrawThin(tableComposant);
            return (tableText.length > 0);
          
          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      },

      /**
       * Restaure un canvas a partir d'une instance de Dessin.
       * 
       * @param dessin
       */
      restoreCanvas: function(dessin){
        // Regénère la boite.
        boite = canvasGeneration.newBoite();
        boite.initBoiteWithBoite(dessin.boite);
        boite.effets = tableEffet;
        dessin.boite = boite;
        this.resizeCanvas();
        // Créer les flèches autour de la boite.
        tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
        tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));

        // Rajoute tout les effets au canvas.
        //@todo addToCanvas with load option car on peut pas faire incanvas...
        for (var i = 0 ; i < dessin.options.length ; i++){
          if (dessin.options[i].inCanvas === true){
            this.addToCanvas(dessin.options[i], true);
          }
        }
      },

      /**
       * Agrandit/reduit le canvas pour qu'il soit au moins aussi grand que la boite.
       */
      resizeCanvas: function(){
        if (boite.fonction === 'Boite') {
          var realmargin = 150;

          var canvasInitialSize = canvasConversion.getCanvasSize();
          var posExt = boite.findExtreme();

          // Test droite.
          canvasSetting.canvas.width = Math.max((posExt.r + realmargin), canvasInitialSize.w);

          // Test bas.
          canvasSetting.canvas.height = Math.max((posExt.b + realmargin), canvasInitialSize.h);
        }
      },

      ///**
      // * Donne les coordonnées d'un rectangle qui entoure tout les objs.
      // *
      // * Cette fonction retourne :
      // * t : position la plus petite de l'obj le plus en haut.
      // * r : position la plus grande de l'obj le plus à droite.
      // * b : position la plus grande de l'obj le plus en bas.
      // * l : la position la plus petite de l'obj le plus à gauche.
      // *
      // * @returns {{t: number, r: number, b: number, l: number}}
      // */
      //findGlobalRect: function (){
      //  var saveMax = function(posmax, pos){
      //    posmax.t = Math.min(posmax.t, pos.t);
      //    posmax.r = Math.max(posmax.r, pos.r);
      //    posmax.b = Math.max(posmax.b, pos.b);
      //    posmax.l = Math.min(posmax.l, pos.l);
      //  };
      //
      //  var i, j;
      //
      //  var effet;
      //  var compos, compo;
      //
      //  var pos = {t:Infinity,r:-Infinity,b:-Infinity,l:Infinity},
      //      posmax = {t:Infinity,r:-Infinity,b:-Infinity,l:Infinity};
      //
      //  for (i = 0 ; i < tableEffet.length ; i++) {
      //    effet = tableEffet[i];
      //
      //    // Recupère les bords
      //    pos = effet.findExtreme();
      //    // Garde le maximum.
      //    saveMax(posmax, pos);
      //
      //    if (canvasSetting.debrayable){
      //      compos = effet.composants;
      //      for (j = 0; j < compos.length; j++) {
      //        compo = compos[j];
      //        // Recupère les bords
      //        pos = compo.findExtreme();
      //        // Garde le maximum.
      //        saveMax(posmax, pos);
      //      }
      //    }
      //  }
      //
      //  return posmax;
      //},


      /**
       * Centre les élements dans le canvas.
       */
      centerInCanvas: function() {
        if (boite.points) {
          boite.moveToCenterWindow(canvasSetting);
        }
      },

      /**
       * Redimentionne la boite si l'entity depasse.
       * Si l'entity est un effet ou un composant.
       * @param entity
       */
      checkBorderBoxRotate: function(entity){
        var vect;
        var fonc = entity.fonction;
        if (fonc === 'effet') {
          masterBoite.checkBorderBoite(canvasSetting.viewState, entity);
          vect = boite.moveCloseBorder(canvasSetting.canvas, canvasSetting.marginCanvas);
          boite.moveEffetCompo(vect);
        }
      },

      /**
       * Ajoute du texte au canvas.
       * @param string
       */
      addTextToCanvas: function(string, pos) {
        var texte, p;

        p = pos || {x: 400, y: 400};

        texte = canvasGeneration.newTexte(string);
        texte.moveTo(p);
        masterBoite.projections[canvasSetting.viewState].textDeco.push(texte);

        // Rajoute le texte à la table texte.
        tableText.push(texte);
      },

      //actualisePoints: function(value, data){
      //  data.actualisePoints(canvasSetting.ctx, value);
      //},

      actualisePoints: function(data){
        data.actualisePoints();
      },

      getCanvasSetting: function(){
        return canvasSetting;
      },

      setCtx: function(context) {
        canvasSetting.ctx = context;
      },

      setCanvas: function(canv){
        var canvasSize = canvasConversion.getCanvasSize();
        canv.width = canvasSize.w;
        canv.height = canvasSize.h;
        canvasSetting.canvas = canv;
      },

      setCanvasWindow: function(canvasWindow){
        var canvasSize = canvasConversion.getCanvasSize();
        canvasWindow.style.width = canvasSize.w.toString() + 'px';
        canvasWindow.style.height = canvasSize.h.toString() + 'px';
        canvasSetting.canvasWindow = canvasWindow;
      },

      setMarginCanvas: function(margin){
        canvasSetting.marginCanvas = margin;
      },

      setDeb: function(deb){
        canvasSetting.debrayable = deb;
      },

      setViewState: function(state){
        canvasSetting.viewState = state;
      },

      setIsActive: function(active){
        canvasSetting.isActive = active;
        //data.actualisePoints(value);
      },

      getTableText: function() {
        return tableText;
      },

      setTableText: function(tabr) {
        var i = tableText.length;
        var j = tabr.length;
        tableText.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableText.push(tabr[k]);
        }
        return tableText;
      },

      resetTableText: function() {
        tableText.splice(0, tableText.length);
      },
      
      
      //@todo optimisation possible check arraw active.
      setArrowPos: function(){
        for(var i = 0; i < tableArrow.length; i++){
          tableArrow[i].setPos(tableArrow[i].loc);
        }
      },

      resetCompPos: function(value){
        if (!value) {
          for (var i = 0; i < tableEffet.length; i++) {
            tableEffet[i].resetCompPos();
          }
        }
      },

      resetIsSelected: function(tabr) {
        for (var i = 0; i < tabr.length; i++){
          tabr[i].isSelected = false;
        }
      },
      
      updateComposantInCanvas: function(compo){
        var effet = this.searchEffetByKey(compo.key);
        if (effet) {
          var indexEffet = this.searchTabByIdReturnIndex(tableEffet, effet._id, effet.key);
          var indexEffetCompo = this.searchTabByIdReturnIndex(tableEffet[indexEffet].composants, compo._id, compo.key);
          var indexCompo = this.searchTabByIdReturnIndex(tableComposant, compo._id, compo.key);
          // On genere une nouveau composant.
          // On met à jour le shapeObject.
          tableEffet[indexEffet].composants[indexEffetCompo] = tableComposant[indexCompo] = thing(compo);
          tableEffet[indexEffet].composants[indexEffetCompo].changeShape();
        }
      },

      searchTabByIdReturnIndex: function(tab, id, key){
        for(var i = 0; i < tab.length; i++){
          if(tab[i]._id === id && tab[i].key === key) {
            return i;
          }
        }
        return false;
      },

      searchEffetByKey: function(key){
        for(var i = 0; i < tableEffet.length; i++){
          if(tableEffet[i].key === key) {
            return tableEffet[i];
          }
        }
        return false;
      },

      searchEffetById: function(id, key){
        for(var i = 0; i < tableEffet.length; i++){
          if(tableEffet[i]._id === id && tableEffet[i].key === key) {
            return tableEffet[i];
          }
        }
        return false;
      },

      searchCompoById: function(id, key){
        for(var i = 0; i < tableComposant.length; i++){
          if(tableComposant[i]._id === id && tableComposant[i].key === key) {
            return tableComposant[i];
          }
        }
        return false;
      },

      getZoom: function(){
        return canvasConversion.getZoomRatio();
      },
      
      setBoite: function(bo){
        boite = bo;
        return boite;
      },

      getBoite: function(){
        return boite;
      },

      setMasterBoite: function(bo){
        masterBoite = bo;
        return masterBoite;
      },

      getMasterBoite: function(){
        return masterBoite;
      },

      setTableEffet: function(tabr) {
        var i = tableEffet.length;
        var j = tabr.length;
        tableEffet.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableEffet.push(tabr[k]);
        }
        return tableEffet;
      },

      getTableEffet: function(){
        return tableEffet;
      },

      resetTableEffet: function(){
        var i = tableEffet.length;
        tableEffet.splice(0, i);
      },

      setTableComposant: function(tabr) {
        var i = tableComposant.length;
        var j = tabr.length;
        tableComposant.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableComposant.push(tabr[k]);
        }
        return tableComposant;
      },

      getTableComposant: function(){
        return tableComposant;
      },

      resetTableComposant: function(){
        var i = tableComposant.length;
        tableComposant.splice(0, i);
      },

      setActiveItem: function(item){
        var i = activeItem.length;
        activeItem.splice(0, i);
        activeItem.push(item);
        return activeItem;
      },

      getActiveItem: function(){
        return activeItem;
      },

      resetActiveItem: function(){
        var i = activeItem.length;
        activeItem.splice(0, i);
      },

      setTableAlignLine: function(tabr) {
        tableAlignLine = tabr;
        return tableAlignLine;
      },

      getTableAlignLine: function(){
        return tableAlignLine;
      },

      resetTableAlignLine: function(){
        tableAlignLine = [];
      },

      setTableArrow: function(tabr) {
        var i = tableArrow.length;
        var j = tabr.length;
        tableArrow.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableArrow.push(tabr[k]);
        }
        return tableArrow;
      },

      getTableArrow: function(){
        return tableArrow;
      },

      resetTableArrow: function(){
        var i = tableArrow.length;
        tableArrow.splice(0, i);
      },

      setTableActive: function(tabr){
        tableActive = tabr;
      },

      getTableActive: function(){
        return tableActive;
      },

      resetTableActive: function(){
        tableActive = [];
      },

      setTableDrawDashed: function(tabr){
        tableDrawDashed = tabr;
      },

      getTableDrawDashed: function(){
        return tableDrawDashed;
      },

      resetTableDrawDashed: function(){
        tableDrawDashed = [];
      },

      //////////// @Todo : a supprimer, table de travail.
      setTableDrawLimits: function(tabr){
        tableDrawLimits = tabr;
      },

      getTableDrawLimits: function(){
        return tableDrawLimits;
      },

      resetTableDrawLimits: function(){
        tableDrawLimits = [];
      },
      /////////////// Fin todo.

      setTableDrawShine: function(tabr){
        for (var i = 0; i < tabr.length; i++){
          tabr[i].isSelected = true;
        }
        tableDrawShine = tabr;
      },

      getTableDrawShine: function(){
        return tableDrawShine;
      },
      
      resetTableDrawShine: function(){
        for (var i = 0; i < tableDrawShine.length; i++){
          tableDrawShine[i].isSelected = false;
        }
        tableDrawShine = [];
      },

      setTableDrawThin: function(tabr){
        checkCollision.checkAll(tabr);
        tableDrawThin = tabr;
      },

      getTableDrawThin: function(){
        return tableDrawThin;
      },

      resetTableDrawThin: function(){
        tableDrawThin = [];
      },
      
      resetAll: function(){
        boite = {};
        this.resetTableEffet();
        this.resetTableComposant();
        this.resetTableActive();
        this.resetTableDrawDashed();
        this.resetTableDrawThin();
        this.resetTableDrawShine();
        this.resetTableAlignLine();
        this.resetTableArrow();
        this.resetTableText();
      },

      // @todo a supprimer
      drawRulers: function() {
        rulers.render(canvasSetting.canvas, canvasSetting.ctx, '#aaa', 'pixels', 100);
      },

      // @todo a supprimer
      drawGrid: function() {
        rulers.drawGrid(canvasSetting.canvas, canvasSetting.ctx);
      },

      // @todo a supprimer
      tableState: function(){
        return {
          masterBoite: masterBoite,
          boite: boite,
          tableEffet: tableEffet,
          tableComposant: tableComposant,
          tableActive: tableActive,
          tableDrawDashed:  tableDrawDashed,
          tableDrawThin: tableDrawThin,
          tableDrawShine: tableDrawShine,
          tableArrow:  tableArrow,
          tableText: tableText
        };
      }
      
    };
  });
