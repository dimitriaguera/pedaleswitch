'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasControl', function (canvasGeneration, canvasConversion, checkCollision, rulers) {
    // Service logic
    // ...

    var ctx = {};
    var canvas = {};
    var canvas_window = {};
    var boite = null;
    var tableEffet = [];
    var tableComposant = [];
    var tableActive = [];
    var tableDashed = [];
    var tableThin = [];
    var tableShine = [];
    var tableAlignLine = [];
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
    return {

      //@todo a supprimer
      tableState: function(){
        return {
        tableEffet: tableEffet,
        tableComposant: tableComposant,
        tableActive: tableActive,
        tableDashed:  tableDashed,
        tableThin: tableThin,
        tableShine: tableShine
        }
      },
      
      
      /**
       * Cette fonction créé les objets du canvas à partir du modèle dessin.
       * Et l'ajoute dans tableEffet et tableComposant pour les composants correspondants.
       * 
       * @param effet : objet effet du modele dessin (entrée de la table option du panier).
       */
      addToCanvas: function(effet) {
        // if check si l'effet est deja dans le canvas.
        if (!effet.in_canvas) {
          effet.in_canvas = true;
          var tmp_eff = canvasGeneration.newRect(effet);
          var tmp_comp = [];
          var compos = effet.composants;
          for (var i = 0; i < compos.length; i++) {
              tmp_comp = thing(compos[i]);
              tableComposant.push(tmp_comp);
              tmp_eff.composants.push(tmp_comp);
          }

          // Empeche que l'effet depasse du canvas.
          canvasConversion.moveCloseBorder(tmp_eff, canvas);

          // Place bien les composants.
          tmp_eff.resetCompPos();

          // Créer le boitier de la pedale.
          if(!boite){
            boite = canvasGeneration.newBoite(effet);
            canvasConversion.initializeMarginBoite(boite);
          }
          else {
            boite.checkBorderBoite(tmp_eff);
          }

          tableEffet.push(tmp_eff);

          // Check les collisions entre tout les obj.
          checkCollision.checkall(tableEffet);

          return tmp_eff;
        }
      },

      // Empeche que l'effet depasse du canvas.
      moveCloseBorder: function(effet){
        canvasConversion.moveCloseBorder(effet, canvas);
      },
      
      
      removeToCanvas: function(effet) {
        effet.in_canvas = false;
        var index = this.searchTabByIdReturnIndex(tableEffet, effet._id, effet.key);
        if(index !== false){
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
        checkCollision.checkall(tabr);
        tableActive = tabr;
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
        checkCollision.checkall(tabr);
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
      
    };
  });
