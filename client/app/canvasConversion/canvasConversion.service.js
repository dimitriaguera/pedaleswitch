'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasConversion', function () {

    var zoomOption = {};

    var convertSizePoints = function (points, ratio){
      for (var i = 0, l = points.length; i < l ; i++){
        points[i].x = Math.round(ratio * points[i].x);
        points[i].y = Math.round(ratio * points[i].y);
      }
    };

    var convertSize = function (entity, ratio) {

      if (entity.fonction === 'MasterBoite'){

        entity.margin = Math.round(ratio * entity.margin);
        entity.initialHeight = Math.round(ratio * entity.initialHeight);

        entity.size.d = Math.round(ratio * entity.size.d);
        entity.size.d1 = Math.round(ratio * entity.size.d1);
        entity.size.d2 = Math.round(ratio * entity.size.d2);
        entity.size.h = Math.round(ratio * entity.size.h);
        entity.size.w = Math.round(ratio * entity.size.w);

        convertSize(entity.projections.bottom, ratio);
        convertSize(entity.projections.down, ratio);
        convertSize(entity.projections.left, ratio);
        convertSize(entity.projections.right, ratio);
        convertSize(entity.projections.top, ratio);
        convertSize(entity.projections.up, ratio);
      }
      else if (entity.fonction === 'Boite'){

        entity.margin = Math.round(ratio * entity.margin);

        // Convertit les points de la boite.
        convertSizePoints(entity.points, ratio);

        if (entity.textDeco.length !== 0){
          for (var j = 0; j < entity.textDeco.length; j++) {
            convertSizePoints(entity.textDeco[j].points, ratio);
            entity.textDeco[j].font.size = Math.round(ratio * entity.textDeco[j].font.size);
          }
        }
      }
      // Entity est un effet.
      else {
        // Convertie les points de l'entity.
        convertSizePoints(entity.points, ratio);

        // Convertie les composants
        if (entity.composants && entity.fonction !== 'Boite') {
          for (var i = 0, l = entity.composants.length ; i < l ; i++) {
            convertSizePoints(entity.composants[i].points, ratio);
            convertSizePoints(entity.composants[i].pointsDefault, ratio);
          }
        }
      }
    };

    // Public API here
    return {

      setZoomOption: function(zoomopt){
        zoomOption = zoomopt;
      },

      getZoomRatio: function () {
        return Math.round(zoomOption.zoom * 100);
      },

      setZoom: function (increment) {
        var newZoom = zoomOption.zoom + increment;
        if(newZoom > 0.2 && newZoom <= 2) {
          zoomOption.oldZoom = zoomOption.zoom;
          zoomOption.zoom = newZoom;
          return true;
        }
        return false;
      },
      
      convertToPixel: function(value){
        var newRatio = zoomOption.resolution / zoomOption.resoInMm;
        return Math.round(zoomOption.zoom * newRatio * value);
      },

      convertToMm: function(value){
        var newValue = value / zoomOption.zoom;
        newValue = newValue / zoomOption.resolution/zoomOption.resoInMm;
        return Math.round(newValue);
      },

      /**
       * Convertie tout les dim d'une instance de Dessin en Mm.
       * @param dessin
       */
      convertDessinToMm: function(dessin){
        
        var ratio = 1 / (zoomOption.resoInMm * zoomOption.zoom * zoomOption.resolution);

        // Convertie la boite
        convertSize(dessin.boite, ratio);
        
        // Convertie tt les options.
        for (var i = 0 ; i < dessin.options.length; i++){
          convertSize(dessin.options[i], ratio);
        }
        
      },
      
      convertDessinToPixel: function(dessin){

        var ratio = zoomOption.zoom * zoomOption.resolution * zoomOption.resoInMm;

        // Convertie la boite
        convertSize(dessin.boite, ratio);

        // Convertie tt les options.
        for (var i = 0 ; i < dessin.options.length ; i++){
          convertSize(dessin.options[i], ratio);
        }
        
      },

      initializeEffetZoom: function (entity) {
        convertSize(entity, zoomOption.zoom);
      },

      convertEffetZoom: function (entity) {
        var newRatio = zoomOption.zoom / zoomOption.oldZoom;
        convertSize(entity, newRatio);
      },

      convertEffetSize: function (entity) {
        var newRatio = zoomOption.resolution/zoomOption.resoInMm;
        convertSize(entity, newRatio);
      }


    };
  });
