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
            var canvas = document.createElement('canvas'),
              ctx = canvas.getContext('2d'),
              img = document.createElement("img");
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle= "black";
            ctx.rect(0, 0, sc.effet.size.w, sc.effet.size.h);
            ctx.stroke();
            img.src = canvas.toDataURL('image/png');
            e.dataTransfer.setDragImage(img, sc.effet.size.w/2, sc.effet.size.h/2);

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
