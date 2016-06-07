'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasControl', function (canvasGeneration, canvasConversion, checkCollision, rulers) {
    // Service logic

    var ctx = {};
    var canvas = {};
    var canvas_window = {};
    var boite = {};
    var tableEffet = [];
    var tableComposant = [];
    var tableActive = {};
    var tableDashed = [];
    var tableThin = [];
    var tableShine = [];
    var tableAlignLine = [];
    var tableArrow = [];
    var activeItem = [];
    var debrayable = false;

    var thing = function(entity) {
      switch (entity.shape){
        case 'Rect':
          return canvasGeneration.newRect(entity);
          break;
        case 'Cercle':
          return canvasGeneration.newCercle(entity);
          break;
        case 'Poly':
          //return canvasGeneration.newPoly(entity);
          break;
        default:
          console.log('Shape not match in canvasControl :' + entity.shape);
          return false;
      }      
    };
    
    
    // Public API here
    return{
         
    
      resetAll: function(){
        boite = {};
        tableEffet = [];
        tableComposant = [];
        tableActive = [];
        tableDashed = [];
        tableThin = [];
        tableShine = [];
        tableAlignLine = [];
        tableArrow = [];
        debrayable = false;
      },

      //@todo a supprimer
      tableState: function(){
        return {
        tableEffet: tableEffet,
        tableComposant: tableComposant,
        tableActive: tableActive,
        tableDashed:  tableDashed,
        tableThin: tableThin,
        tableShine: tableShine,
        tableArrow:  tableArrow
        }
      },

      /**
       * Cette fonction créé les objets du canvas à partir du modèle dessin.
       * Et l'ajoute dans tableEffet et tableComposant pour les composants correspondants.
       *
       * @param effet : objet effet du modele dessin (entrée de la table option du panier).
       * @para bol : si true alors rajoute l'effet meme si il est deja dans le canvas
       *             sert au fonction de chargement depuis la db ou localstorage.
       */
      addToCanvas: function(effet, bol) {
        bol = bol || false;

        // if check si l'effet est deja dans le canvas.
        if (!effet.in_canvas || bol) {
          var tmp_eff = canvasGeneration.newRect(effet);
          var tmp_comp = [];
          var compos = effet.composants;
          for (var i = 0; i < compos.length; i++) {
              tmp_comp = thing(compos[i]);
              tableComposant.push(tmp_comp);
              tmp_eff.composants.push(tmp_comp);
          }
          
          // Créer le boitier de la pedale.
          if(boite.constructor.name !== "Boite") {
            boite = canvasGeneration.newBoite();
            // Conver marge en px.
            boite.convertMargin();
            // Empeche que l'effet depasse du canvas.
            this.moveCloseBorder(tmp_eff);
            // Place bien les composants.
            tmp_eff.resetCompPos();
            // Initiliase la boite.
            boite.initBoiteWithEffect(tmp_eff);
            // Lie les effets a la boite
            boite.effets = tableEffet;
            // Créer les flèches autour de la boite.
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
          }
          else {
            // Empeche que l'effet depasse du canvas.
            this.moveCloseBorder(tmp_eff);
            // Place bien les composants.
            if (!effet.in_canvas) {
              tmp_eff.resetCompPos();
            }
            // Redimensionne la boite si le nouvelle effet est en dehors.
            boite.checkBorderBoite(tmp_eff);
            // Repositionne les arraw.
            this.setArrowPos();
          }
          // Rajoute la propriété in_canvas a l'effet.
          effet.in_canvas = true;

          // Rajoute l'effet a la table effet.
          tableEffet.push(tmp_eff);

          // Check les collisions entre tout les obj.
          checkCollision.checkAll(tableEffet);

          return tmp_eff;
        }
      },

      /**
       * Fonction pour restaurer un canvas a partir d'une instance de Dessin.
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
          if (dessin.options[i].in_canvas === true){
            this.addToCanvas(dessin.options[i], true);
          }
        }
      },


      /**
       * Empeche que l'effet depasse du canvas.
       * @param effet
       */
      moveCloseBorder: function(effet){
        // On deplace un effet.
        if (effet.constructor.name !== "Boite"){
          canvasConversion.moveCloseBorder(effet, boite.margin, canvas);
        } 
        // On deplace la boite.  
        else {
          canvasConversion.moveCloseBorder(effet, 0, canvas);
        }
      },

      /**
       * Agrandit le canvas pour qu'il soit au moins aussi grand que la boite.
       */
      resizeCanvas: function(){
        if (boite.constructor.name === "Boite") {
          var realmargin = 150;
          var bbot = boite.getBottom(),
              bright = boite.getRight();

          // Debordement par la droite.
          if (bright + realmargin > canvas.width) {
            canvas.width = bright + realmargin;
          }
          // Debordement par le bas.
          if (bbot + realmargin > canvas.height) {
            canvas.height = bbot + realmargin;
          }
        }
      },
      
      //@todo optimisation possible check arraw active.
      setArrowPos: function(){
        for(var i = 0; i < tableArrow.length; i++){
          tableArrow[i].setPos(tableArrow[i].loc);
        }
      },

      removeToCanvas: function(effet) {
        var index = this.searchTabByIdReturnIndex(tableEffet, effet._id, effet.key);
        if(index !== false){
          effet.in_canvas = false;
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

      searchTabByIdReturnIndex: function(tab, id, key){
        for(var i = 0; i < tab.length; i++){
          if(tab[i]._id === id && tab[i].key === key) {
            return i;
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

      //zoomInitialize: function(value){
      //  canvasConversion.setZoom(value);
      //  for (var i = 0; i < tableEffet.length; i++) {
      //    canvasConversion.initializeEffetZoom(tableEffet[i]);
      //  }
      //  this.drawStuff();
      //},
      //
      //zoomChange: function(value){
      //  var okZoom = canvasConversion.setZoom(value);
      //  if (okZoom) {
      //    for (var i = 0; i < tableEffet.length; i++) {
      //      canvasConversion.convertEffetZoom(tableEffet[i]);
      //    }
      //    this.drawStuff();
      //  }
      //  return okZoom;
      //},
      
      drawRulers: function() {
        rulers.render(canvas, ctx, '#aaa', 'pixels', 100);
      },
      
      drawGrid: function() {
        rulers.drawGrid(canvas, ctx);
      },

      resetCompPos: function(value){
        if (!value) {
          for (var i = 0; i < tableEffet.length; i++) {
            tableEffet[i].resetCompPos();
          }
        }
      },
      
      setBoite: function(bo){
        boite = bo;
      },

      getBoite: function(){
        return boite;
      },

      setActiveItem: function(item){
        var i = activeItem.length;
        activeItem.splice(0, i);
        activeItem.push(item);
      },

      getActiveItem: function(){
        return activeItem;
      },

      resetActiveItem: function(){
        var i = activeItem.length;
        activeItem.splice(0, i);
      },

      setDeb: function(deb){
        debrayable = deb;
      },

      getDeb: function(){
        return debrayable;
      },

      setCanvas: function(canv){
        var canvasSize = canvasConversion.getCanvasSize();
        canv.width = canvasSize.w;
        canv.height = canvasSize.h;
        canvas = canv;
      },

      setCanvasWindow: function(canv_window){
        var canvasSize = canvasConversion.getCanvasSize();
        canv_window.style.width = canvasSize.w.toString() + "px";
        canv_window.style.height = canvasSize.h.toString() + "px";
        canvas_window = canv_window;
      },


      getCanvas: function(){
        return canvas;
      },

      setCtx: function(context) {
        ctx = context;
      },

      getCtx: function(){
        return ctx;
      },

      setTableActive: function(tabr){
        //@todo ne pas mettre cela ici car créer un bug lors du changement de table.
        //checkCollision.checkall(tabr);
        tableActive = tabr;
        return tableActive;
      },

      getTableActive: function(){
        return tableActive;
      },

      setTableDashed: function(tabr){
        tableDashed = tabr;
      },

      getTableDashed: function(){
        return tableDashed;
      },

      resetTableDashed: function(){
        tableDashed = [];
      },

      setTableShine: function(tabr){
        for (var i = 0; i < tabr.length; i++){
          tabr[i].isSelected = true;
        }
        tableShine = tabr;
      },

      getTableShine: function(){
        return tableShine;
      },
      
      resetIsSelected: function(tabr) {
        for (var i = 0; i < tabr.length; i++){
          tabr[i].isSelected = false;
        }
      },

      resetTableShine: function(){
        for (var i = 0; i < tableShine.length; i++){
          tableShine[i].isSelected = false;
        }
        tableShine = [];
      },

      setTableThin: function(tabr){
        checkCollision.checkAll(tabr);
        tableThin = tabr;
      },

      getTableThin: function(){
        return tableThin;
      },

      resetTableThin: function(){
        tableThin = [];
      },

      setTableEffet: function(tabr) {
        tableEffet = tabr;
      },

      getTableEffet: function(){
        return tableEffet;
      },

      setTableComposant: function(tabr) {
        tableComposant = tabr;
      },

      getTableComposant: function(){
        return tableComposant;
      },

      setTableAlignLine: function(tabr) {
        tableAlignLine = tabr;
      },

      getTableAlignLine: function(){
        return tableAlignLine;
      },

      setTableArrow: function(tabr) {
        tableArrow = tabr;
      },

      getTableArrow: function(){
        return tableArrow;
      }
      
    };
  });
