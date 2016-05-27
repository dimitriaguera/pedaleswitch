'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasConversion', function ($window) {
    // Service logic
    // ...

    //var resolution = 72;
    //var resoInMm = 25.4;
    var resolution = 1;
    var resoInMm = 1;
    var ratioW = 3/4.2;
    var ratioH = 300;
    var oldZoom = 1;
    var zoom = 1;

    var convertSize = function (entity, ratio) {
      entity.pos.x = Math.round(ratio * entity.pos.x);
      entity.pos.y = Math.round(ratio * entity.pos.y);
      entity.size.w = Math.round(ratio * entity.size.w);
      entity.size.h = Math.round(ratio * entity.size.h);
      var compos = entity.composants;
      for (var i = 0; i < compos.length; i++){
        compos[i].pos.x = Math.round(ratio * compos[i].pos.x);
        compos[i].pos.y = Math.round(ratio * compos[i].pos.y);
        compos[i].pos_default.x = Math.round(ratio * compos[i].pos_default.x);
        compos[i].pos_default.y = Math.round(ratio * compos[i].pos_default.y);
        compos[i].size.w = Math.round(ratio * compos[i].size.w);
        compos[i].size.h = Math.round(ratio * compos[i].size.h);
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



    };
  });
