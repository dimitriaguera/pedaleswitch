'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasControl', function (canvasGeneration, canvasConversion) {
    // Service logic
    // ...

    var ctx = {};
    var canvas = {};
    var tableEffet = [];
    var tableComposant = [];
    var tableActive = [];
    var tableDashed = [];
    var tableThin = [];
    var tableShine = [];
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
      
      addToCanvas: function(effet) {
        // if check si l'effet est deja dans le canvas.
        if (!effet.incanvas) {
          effet.incanvas = true;
          var tmp_eff = canvasGeneration.newRect(effet);
          var tmp_comp = [];
          var compos = effet.composants;
          for (var compo in compos) {
            if (compos.hasOwnProperty(compo)) {
              tmp_comp = thing(compos[compo]);
              tableComposant.push(tmp_comp);
              tmp_eff.composants.push(tmp_comp);
            }
          }
          canvasConversion.convertEffetSize(tmp_eff);
          canvasConversion.initializeEffetZoom(tmp_eff);
          tableEffet.push(tmp_eff);
        }
      },

      removeToCanvas: function(effet) {
        effet.incanvas = false;
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

      zoomInitialize: function(value){
        canvasConversion.setZoom(value);
        for (var i = 0; i < tableEffet.length; i++) {
          canvasConversion.initializeEffetZoom(tableEffet[i]);
        }
        this.drawStuff();
        return canvasConversion.getZoomRatio();
      },

      zoomChange: function(value){
        var okZoom = canvasConversion.setZoom(value);
        if (okZoom) {
          for (var i = 0; i < tableEffet.length; i++) {
            canvasConversion.convertEffetZoom(tableEffet[i]);
          }
          this.drawStuff();
        }
        return okZoom;
      },

      drawStuff: function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.setLineDash([0, 0]);
        ctx.save();

        if(tableActive.length !== 0) {
          ctx.restore();
          ctx.lineWidth = '1px';
          ctx.strokeStyle = "black";
          for (var i = 0; i < tableActive.length; i++) {
            tableActive[i].drawCanvas(ctx);
          }
        }

        if(tableThin.length !== 0) {
          ctx.restore();
          ctx.lineWidth = 0.5;
          ctx.strokeStyle = "gray";
          for (var j = 0; j < tableThin.length; j++) {
            tableThin[j].drawCanvas(ctx);
          }
        }

        if(tableDashed.length !== 0) {
          ctx.restore();
          ctx.lineWidth = 0.3;
          ctx.setLineDash([10, 3]);
          ctx.strokeStyle = "gray";
          for (var k = 0; k < tableDashed.length; k++) {
            tableDashed[k].drawCanvas(ctx);
          }
        }

        if(tableShine.length !== 0) {
          ctx.restore();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#00bfff";
          for (var l = 0; l < tableShine.length; l++) {
            tableShine[l].drawCanvas(ctx);
          }
        }
      },

      resetCompPos: function(value){
        if (!value) {
          for (var i = 0; i < tableEffet.length; i++) {
            tableEffet[i].resetCompPos();
          }
          this.drawStuff();
        }
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
        tableShine = tabr;
      },

      getTableShine: function(){
        return tableShine;
      },

      resetTableShine: function(){
        tableShine = [];
      },

      setTableThin: function(tabr){
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
      }

    };
  });
