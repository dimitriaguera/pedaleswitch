'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasControl', function (canvasGeneration) {
    // Service logic
    // ...

    var ctx = {};
    var canvas = {};
    var tableEffet = [];
    var tableComposant = [];

    // Public API here
    return {

      addToCanvas: function(effet) {
        tableEffet.push(canvasGeneration.newRect(effet));
        var compo = effet.composants;
        var nb = compo.length;
        for (var i = 0; i < nb; i++) {
          tableComposant.push(canvasGeneration.newCercle(compo[i]));
        }
      },

      drawCanvas: function (ctx, entity){
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
        ctx.rect(entity.pos.x, entity.pos.y, entity.size.w, entity.size.h);
        ctx.stroke();
      },

      drawStuff: function(table){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(var j=0; j<table.length; j++){
          this.drawCanvas(ctx, table[j]);
        }
      },

      setCanvas: function(canv){
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

/*      getCenterX: function(entity){
        return entity.pos.x + (entity.size.w / 2);
      },

      getCenterY: function(entity){
        return entity.pos.y + (entity.size.h / 2);
      },

      getRadius: function(entity){
        return entity.size.w / 2;
      },

      setCenterX: function(entity, center){
        entity.pos.x = center - (entity.size.w / 2);
      },

      setCenterY: function(entity, center){
        entity.pos.y = center - (entity.size.h / 2);
      },*/

    };
  });
