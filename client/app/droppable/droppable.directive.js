'use strict';

angular.module('pedaleswitchApp')
  .directive('droppable', function (canvasControl, canvasDraw, instanceDessin, canvasConversion) {
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


            //@todo modifier architecture panier et binder addEffet du controleur page dessin.
            var obj = JSON.parse(e.dataTransfer.getData('data'));


            // Lors du drop transmet l'id et le key de l'effet qui est draggé.
            // Puis va chercher l'effet correspondant dans le modèle dessin.
            var effet = instanceDessin.searchEffetInDessin(obj._id, obj.key);

            if(effet && !effet.in_canvas) {

              var  mousePos = {x: e.layerX, y: e.layerY};

              // Le rajoute au canvas avec les bonnes positions.
              canvasControl.addToCanvas(effet, false, mousePos);
              
              // Initialise le boite dans l'instance de dessin.
              instanceDessin.setBoite(canvasControl.getMasterBoite());

              // Dessine.
              canvasDraw.drawStuff();
            }
            return false;
          },
          false
        );


      }
    };
  });
