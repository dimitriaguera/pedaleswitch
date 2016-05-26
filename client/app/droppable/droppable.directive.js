'use strict';

angular.module('pedaleswitchApp')
  .directive('droppable', function (canvasControl, instanceDessin) {
    return {

      link: function(scope, element) {
        // again we need the native object
        var el = element[0];

        el.addEventListener(
          'dragover',
          function(e) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) e.preventDefault();
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragenter',
          function(e) {
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragleave',
          function(e) {
            this.classList.remove('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'drop',
          function(e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) e.stopPropagation();

            // Remove class over.
            this.classList.remove('over');

            // Function to calculate the absolute position
            var offset = function (el, event) {
              var ox = -el.offsetLeft,
                oy = -el.offsetTop;
              while (el = el.offsetParent) {
                ox += el.scrollLeft - el.offsetLeft;
                oy += el.scrollTop - el.offsetTop;
              }
              return [event.clientX + ox, event.clientY + oy];
            };

            var coords = offset(e.target, e);

            var obj = JSON.parse(e.dataTransfer.getData('data'));
            
            var effet = instanceDessin.searchEffetInDessin(obj._id, obj.key);
            if(effet) {
              effet.pos.x = coords[0];
              effet.pos.y = coords[1];
              var compos = effet.composants;
              for (var compo in compos) {
                if (compos.hasOwnProperty(compo)) {
                  compos[compo].pos.x = compos[compo].pos_default.x + effet.pos.x;
                  compos[compo].pos.y = compos[compo].pos_default.y + effet.pos.y;
                }
              }
              canvasControl.addToCanvas(effet);
              canvasControl.drawStuff();
            }
            return false;
          },
          false
        );


      }
    };
  });
