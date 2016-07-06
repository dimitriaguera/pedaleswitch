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


            var size = {w: sc.effet.points[1].x - sc.effet.points[0].x , h: sc.effet.points[2].y - sc.effet.points[1].y};
            canvasimg.width = size.w;
            canvasimg.height = size.h;

            var  ctximg = canvasimg.getContext('2d'),
              img = document.createElement('img');
            
            ctximg.beginPath();
            ctximg.lineWidth = 5;
            ctximg.strokeStyle = 'red';
            ctximg.moveTo(sc.effet.points[0].x, sc.effet.points[0].y);
            for (var i = 0, length = sc.effet.points.length ; i < length; i++) {
              ctximg.lineTo(sc.effet.points[i].x, sc.effet.points[i].y);
            }
            ctximg.closePath();
            ctximg.stroke();

            img.src = canvasimg.toDataURL('image/gif');
            e.dataTransfer.setDragImage(img, canvasimg.width/2, canvasimg.height/2);

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
    };
  });
