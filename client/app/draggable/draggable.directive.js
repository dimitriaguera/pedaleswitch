'use strict';

angular.module('pedaleswitchApp')
  .directive('draggable', function () {
    return {

      link: function(scope, element) {
        // this gives us the native JS object
        var el = element[0];
        var sc = scope;

        el.draggable = true;

        el.addEventListener(
          'dragstart',
          function (e) {

            this.classList.add('drag');

            // Ceci crée un canvas dynamique qui va servir a l'affichage de l'image quand on drag.
            // Obliger de convertir le canvas en image car sinon il ne s'affiche pas.
            // L'autre methode et de l'ajouter au body mais il faut apres le cacher et le supprimer au drop.
            var canvasimg = document.createElement('canvas');

            canvasimg.width = sc.effet.size.w.v;
            canvasimg.height = sc.effet.size.h.v;

            var  ctximg = canvasimg.getContext('2d'),
              img = document.createElement("img");

            ctximg.beginPath();
            ctximg.lineWidth = 1;
            ctximg.strokeStyle= "green";
            ctximg.rect(0, 0, sc.effet.size.w.v, sc.effet.size.h.v);
            ctximg.stroke();
            img.src = canvasimg.toDataURL("image/gif");
            e.dataTransfer.setDragImage(img, sc.effet.size.w.v/2, sc.effet.size.h.v/2);


            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('data', JSON.stringify(sc.effet));

            return false;
          },
          false
        );

        el.addEventListener(
          'dragend',
          function (e) {
            this.classList.remove('drag');
            return false;
          },
          false
        );
      }
    }
  });
