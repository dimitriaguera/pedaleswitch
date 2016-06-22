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

        // Convertie les points de la boite.
        convertSizePoints(entity.points, ratio);

      }
      // Entity est un effet.
      else {
        // Convertie les points de l'entity.
        convertSizePoints(entity.points, ratio);

        // Convertie les composants
        if (entity.composants && entity.fonction !== 'Boite') {
          for (var i = 0, l = entity.composants.length ; i < l ; i++) {
            convertSizePoints(entity.composants[i].points, ratio);
            convertSizePoints(entity.composants[i].points_default, ratio);
          }
        }
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
