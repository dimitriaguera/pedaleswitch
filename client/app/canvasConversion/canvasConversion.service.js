'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasConversion', function (canvasGlobalServ) {

    var zoomOptions = canvasGlobalServ.getZoomOptions();

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

        // Converti les Textes de déco
        if (entity.textDeco.length !== 0){
          for (var j = 0; j < entity.textDeco.length; j++) {
            convertSizePoints(entity.textDeco[j].points, ratio);
            entity.textDeco[j].font.size = Math.round(ratio * entity.textDeco[j].font.size);
            entity.textDeco[j].getSizeTxt();
          }
        }
        // Converti les shape de déco
        if (entity.shapeDeco.length !== 0){
          for (j = 0; j < entity.shapeDeco.length; j++) {
            convertSizePoints(entity.shapeDeco[j].points, ratio);
          }
        }

      }
      // Entity est un effet
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

      setZoom: function (increment) {
        var newZoom = zoomOptions.zoom + increment;
        if(newZoom > 0.2 && newZoom <= 2) {
          zoomOptions.oldZoom = zoomOptions.zoom;
          zoomOptions.zoom = newZoom;
          return true;
        }
        return false;
      },
      
      convertToPixel: function(value){
        var newRatio = zoomOptions.resolution / zoomOptions.resoInMm;
        return Math.round(zoomOptions.zoom * newRatio * value);
      },

      convertToMm: function(value){
        var newValue = value / zoomOptions.zoom;
        newValue = newValue / zoomOptions.resolution/zoomOptions.resoInMm;
        return Math.round(newValue);
      },

      /**
       * Convertie tout les dim d'une instance de Dessin en Mm.
       * @param dessin
       */
      convertDessinToMm: function(dessin){
        
        var ratio = 1 / (zoomOptions.resoInMm * zoomOptions.zoom * zoomOptions.resolution);

        // Convertie la boite
        convertSize(dessin.boite, ratio);
        
        // Convertie tt les options.
        for (var i = 0 ; i < dessin.options.length; i++){
          convertSize(dessin.options[i], ratio);
        }
        
      },
      
      convertDessinToPixel: function(dessin){

        var ratio = zoomOptions.zoom * zoomOptions.resolution * zoomOptions.resoInMm;

        // Convertie la boite
        convertSize(dessin.boite, ratio);

        // Convertie tt les options.
        for (var i = 0 ; i < dessin.options.length ; i++){
          convertSize(dessin.options[i], ratio);
        }
        
      },

      initializeEffetZoom: function (entity) {
        convertSize(entity, zoomOptions.zoom);
      },

      convertEffetZoom: function (entity) {
        var newRatio = zoomOptions.zoom / zoomOptions.oldZoom;
        convertSize(entity, newRatio);
      },

      convertEffetSize: function (entity) {
        var newRatio = zoomOptions.resolution/zoomOptions.resoInMm;
        convertSize(entity, newRatio);
      }


    };
  });