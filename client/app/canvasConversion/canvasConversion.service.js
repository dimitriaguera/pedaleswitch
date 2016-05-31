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

      initializeMarginBoite: function(entity) {
        var newRatio = resolution/resoInMm;
        entity.margin = zoom * newRatio * entity.margin;
        entity.size = {
          w: entity.size.w + 2 * entity.margin,
          h: entity.size.h + 2 * entity.margin
        };
        entity.pos = {
          x: entity.pos.x - entity.margin,
          y: entity.pos.y - entity.margin
        };
        entity.old_pos = {
          x: entity.pos.x - entity.margin,
          y: entity.pos.y - entity.margin
        };
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
       * Permet de modifier les coordonnées d'un thing s'il depace les bordures.
       * //@todo a reflechir.
       */
      moveCloseBorder: function(entity, canvas) {
        var marginTop = 30,
          marginRight = 30,
          marginBottom = 30,
          marginLeft = 30;

        // Regarde si la figure sort du canvas.
        var top = entity.getTop(),
          right = entity.getRight(),
          bottom = entity.getBottom(),
          left = entity.getLeft();

        // Debordement par le haut.
        if (top - marginTop < 0) {
          entity.setCenterY(entity.size.h / 2 + marginTop);
        }
        // Debordement par la droite.
        if (right + marginRight > canvas.width) {
          canvas.width += canvas.width + entity.size.w;
          //entity.setCenterX(canvas.width - entity.size.w / 2 - marginLeft);
        }
        // Debordement par le bas.
        if (bottom + marginBottom > canvas.height) {
          canvas.height += canvas.height + entity.size.h;
          //entity.setCenterY(canvas.height - entity.size.h / 2 - marginTop);
        }
        // Debordement par la gauche.
        if (left - marginLeft < 0) {
          entity.setCenterX(entity.size.w / 2 + marginLeft);
        }
      }

    };
  });
