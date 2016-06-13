'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasConversion', function ($window) {
    // Service logic

    var resolution = 72;
    var resoInMm = 25.4;
    var resolution = 2;
    var resoInMm = 1;
    var ratioW = 3/4.2;
    var ratioH = 300;
    var oldZoom = 1;
    var zoom = 1;

    var convertSize = function (entity, ratio) {
      entity.pos.x.v = Math.round(ratio * entity.pos.x.v);
      entity.pos.y.v = Math.round(ratio * entity.pos.y.v);
      entity.size.w.v = Math.round(ratio * entity.size.w.v);
      entity.size.h.v = Math.round(ratio * entity.size.h.v);
      entity.size.d.v = Math.round(ratio * entity.size.d.v);
      if (entity.composants) {
        var compos = entity.composants;
        for (var i = 0; i < compos.length; i++) {
          compos[i].pos.x.v = Math.round(ratio * compos[i].pos.x.v);
          compos[i].pos.y.v = Math.round(ratio * compos[i].pos.y.v);
          compos[i].pos_default.x.v = Math.round(ratio * compos[i].pos_default.x.v);
          compos[i].pos_default.y.v = Math.round(ratio * compos[i].pos_default.y.v);
          compos[i].size.w.v = Math.round(ratio * compos[i].size.w.v);
          compos[i].size.h.v = Math.round(ratio * compos[i].size.h.v);
          compos[i].size.d.v = Math.round(ratio * compos[i].size.d.v);
        }
      }
      if (entity.margin){
        entity.margin.v = Math.round(ratio * entity.margin.v);
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

      /**
       * Convertie tout les dim d'une instance de Dessin en Mm.
       * @param dessin
       */
      convertDessinToMm: function(dessin){
        
        var ratio = 1 / (resoInMm * zoom * resolution);

        // Convertie la boite
        convertSize(dessin.boite, ratio);
        
        // Convertie tt les options.
        for (var i = 0 ; i < dessin.options.length; i++){
          convertSize(dessin.options[i], ratio);
        }
        
      },
      
      convertDessinToPixel: function(dessin){

        var ratio = zoom * resolution * resoInMm;

        // Convertie la boite
        convertSize(dessin.boite, ratio);

        // Convertie tt les options.
        for (var i = 0 ; i < dessin.options.length ; i++){
          convertSize(dessin.options[i], ratio);
        }
        
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
      }


    };
  });
