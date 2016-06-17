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
      var i, j, l , l2;

      // @todo prise en compte de la boite.
      if (entity.constructor.name !== 'MasterBoite'){
        for (i = 0, l = entity.points.length; i < l ; i++){
          entity.points[i].x = Math.round(ratio * entity.points[i].x);
          entity.points[i].y = Math.round(ratio * entity.points[i].y);
        }

        //@todo a améliorer car cohabitation de deux coordonnées.
        entity.pos.x = entity.points[0].x;
        entity.pos.y = entity.points[0].y;
        entity.size.w = Math.round(ratio * entity.size.w);
        entity.size.h = Math.round(ratio * entity.size.h);
        entity.size.d = Math.round(ratio * entity.size.d);


        if (entity.composants) {
          var compos = entity.composants;
          for (i = 0, l = compos.length ; i < l ; i++) {
            for (j = 0, l2 = compos[i].points.length; j < l2 ; j++){
              compos[i].points[j].x = Math.round(ratio * compos[i].points[j].x);
              compos[i].points[j].y = Math.round(ratio * compos[i].points[j].y);
              compos[i].points_default[j].x = Math.round(ratio * compos[i].points_default[j].x);
              compos[i].points_default[j].y = Math.round(ratio * compos[i].points_default[j].y);
            }

            //@todo a améliorer car cohabitation de deux coordonnées.
            compos[i].pos.x = compos[i].points[0].x;
            compos[i].pos.y = compos[i].points[0].y;
            compos[i].pos_default.x = compos[i].points_default[0].x;
            compos[i].pos_default.y = compos[i].points_default[0].y;
            compos[i].size.w = Math.round(ratio * compos[i].size.w);
            compos[i].size.h = Math.round(ratio * compos[i].size.h);
            compos[i].size.d = Math.round(ratio * compos[i].size.d);
            compos[i].old_size.w = Math.round(ratio * compos[i].old_size.w);
            compos[i].old_size.h = Math.round(ratio * compos[i].old_size.h);
          }
        }
        if (entity.margin){
          entity.margin = Math.round(ratio * entity.margin);
        }


      }

      /*
      entity.pos.x = Math.round(ratio * entity.pos.x);
      entity.pos.y = Math.round(ratio * entity.pos.y);
      entity.size.w = Math.round(ratio * entity.size.w);
      entity.size.h = Math.round(ratio * entity.size.h);
      entity.size.d = Math.round(ratio * entity.size.d);
      if (entity.composants) {
        var compos = entity.composants;
        for (i = 0; i < compos.length; i++) {
          compos[i].pos.x = Math.round(ratio * compos[i].pos.x);
          compos[i].pos.y = Math.round(ratio * compos[i].pos.y);
           = Math.round(ratio * compos[i].pos_default.x);
           = Math.round(ratio * compos[i].pos_default.y);
          compos[i].size.w = Math.round(ratio * compos[i].size.w);
          compos[i].size.h = Math.round(ratio * compos[i].size.h);
          compos[i].size.d = Math.round(ratio * compos[i].size.d);
          compos[i].old_size.w = Math.round(ratio * compos[i].old_size.w);
          compos[i].old_size.h = Math.round(ratio * compos[i].old_size.h);
        }
      }
      if (entity.margin){
        entity.margin = Math.round(ratio * entity.margin);
      }
      */
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
