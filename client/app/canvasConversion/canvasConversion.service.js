'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasConversion', function ($window) {
    // Service logic
    // ...

    var resolution = 72;
    var resoInMm = 25.4;
     var resolution = 2;
     var resoInMm = 1;
     var ratioW = 3/4.2;
     var ratioH = 300;
     var oldZoom = 1;
     var zoom = 1;

    //var resolution = 2;
    //var resoInMm = 1;
    //var ratioW = 1;
    //var ratioH = 0;
    //var oldZoom = 1;
    //var zoom = 1;

    var convertSize = function (entity, ratio) {
      entity.pos.x = Math.round(ratio * entity.pos.x);
      entity.pos.y = Math.round(ratio * entity.pos.y);
      entity.size.w = Math.round(ratio * entity.size.w);
      entity.size.h = Math.round(ratio * entity.size.h);
      if (entity.composants) {
        var compos = entity.composants;
        for (var i = 0; i < compos.length; i++) {
          compos[i].pos.x = Math.round(ratio * compos[i].pos.x);
          compos[i].pos.y = Math.round(ratio * compos[i].pos.y);
          compos[i].pos_default.x = Math.round(ratio * compos[i].pos_default.x);
          compos[i].pos_default.y = Math.round(ratio * compos[i].pos_default.y);
          compos[i].size.w = Math.round(ratio * compos[i].size.w);
          compos[i].size.h = Math.round(ratio * compos[i].size.h);
        }
      }
      if (entity.margin){
        entity.margin = Math.round(ratio * entity.margin);
        entity.old_pos.x = Math.round(ratio * entity.old_pos.x);
        entity.old_pos.y = Math.round(ratio * entity.old_pos.y);
      }
    };

    // Public API here
    return {

      getCanvasSize: function () {
        return {
          w: $window.innerWidth * ratioW,
          h: $window.innerHeight - ratioH
        };
      },

      getZoomRatio: function () {
        return Math.round(zoom * 100);
      },

      setZoom: function (increment) {
        var newZoom = zoom + increment;
        if(newZoom > 0.2 && newZoom <= 2) {
          oldZoom = zoom;
          zoom = newZoom;
          return true;
        }
        return false;
      },
      
      convertToPixel: function(value){
        var newRatio = resolution / resoInMm;
        return Math.round(zoom * newRatio * value);
      },

      convertToMm: function(value){
        var newValue = value / zoom;
        newValue = newValue / resolution/resoInMm;
        return Math.round(newValue);
      },

      initializeEffetZoom: function (entity) {
        convertSize(entity, zoom);
      },

      convertEffetZoom: function (entity) {
        var newRatio = zoom / oldZoom;
        convertSize(entity, newRatio);
      },

      convertEffetSize: function (entity) {
        var newRatio = resolution/resoInMm;
        convertSize(entity, newRatio);
      },

      /**
       * Permet de modifier les coordonnées d'un thing s'il depasse les bordures.
       * @todo a reflechir.
       * @param entity = thing
       * @param boite
       * @param canvas
       */
      moveCloseBorder: function(entity, boitemargin, canvas) {
        var margin = this.convertToPixel(40);

        // Regarde si la figure sort du canvas.
        var top = entity.getTop(),
          right = entity.getRight(),
          bottom = entity.getBottom(),
          left = entity.getLeft();

        var realmargin = margin + boitemargin;

        // Debordement par le haut.
        if (top - realmargin < 0) {
          entity.setCenterY(entity.size.h / 2 + realmargin);
        }
        // Debordement par la droite.
        if (right + realmargin + 150 > canvas.width) {
          canvas.width = right + realmargin + 150;
          //entity.setCenterX(canvas.width - entity.size.w / 2 - margin);
        }
        // Debordement par le bas.
        if (bottom + realmargin + 150 > canvas.height) {
          canvas.height = bottom + realmargin + 150;
          //entity.setCenterY(canvas.height - entity.size.h / 2 - margin);
        }
        // Debordement par la gauche.
        if (left - realmargin < 0) {
          entity.setCenterX(entity.size.w / 2 + realmargin);
        }
      }

    };
  });
