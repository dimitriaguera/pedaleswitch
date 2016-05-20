'use strict';

angular.module('pedaleswitchApp')
  .factory('mouseHelper', function (canvasControl, $rootScope) {

    var dragIdx;
    var dragOffsetX;
    var dragOffsetY;

    // Public API here
    return {

      mousedown: function (ontable) {
        return function (e) {

          var mouseX = e.layerX,
            mouseY = e.layerY;

          for (var i = 0; i < ontable.length; i++) {
            var dx = mouseX - ontable[i].getCenterX();
            var dy = mouseY - ontable[i].getCenterY();

            if (Math.sqrt((dx * dx) + (dy * dy)) < ontable[i].getRadius()) {

              dragIdx = i;
              dragOffsetX = dx;
              dragOffsetY = dy;

              $rootScope.$emit('click-on-element');
              canvasControl.drawStuff(ontable);
            }
          }
        }
      },

      mousemove: function(ontable){
        return function (e) {

          var mouseX = e.layerX,
            mouseY = e.layerY;

          ontable[dragIdx].setCenterX(mouseX - dragOffsetX);
          ontable[dragIdx].setCenterY(mouseY - dragOffsetY);

          canvasControl.drawStuff(ontable);
        }
      },

      mouseup: function(ontable){
        return function (e) {
          $rootScope.$emit('no-click-on-element');
        }
      }
    };
  });
