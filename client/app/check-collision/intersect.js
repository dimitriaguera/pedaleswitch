'use strict';

angular.module('pedaleswitchApp')
  .factory('intersect', function () {

    return {

      /**
       * Renvoie vers le bon comparateur de forme (pt vs rect ou cercle vs rect...) .
       * @param shape
       * @param comparitor
       * @returns {*}
       */
      check: function (shape, comparitor) {
        if (shape.constructor.name === "Rect" && comparitor.constructor.name === "Rect") {
          return this.rectInRect(shape, comparitor);
        }
        else if (shape.constructor.name === "Cercle" && comparitor.constructor.name === "Cercle") {
          return this.circleInCircle(shape, comparitor);
        }
        else {
          return this.rectInCircle(shape, comparitor);
        }
      },

      /**
       * Regarde si un point p est compris entre deux valeurs en les incluants.
       * @param min
       * @param p
       * @param max
       * @returns {boolean}
       */
      between: function (min, p, max) {
        var result;

        result = this.betweenStrict(min, p, max);
        
        if (p == min || p == max) {
          result = true;
        }

        return result;
      },

      /**
       * Regarde si un point p est compris entre deux valeurs en les excluants.
       * @param min
       * @param p
       * @param max
       * @returns {boolean}
       */
      betweenStrict: function (min, p, max) {
        var result = false;
        if (min < max) {
          if (p > min && p < max) {
            result = true;
          }
        }
        if (min > max) {
          if (p > max && p < min) {
            result = true;
          }
        }
        return result;
      },

      /**
       * @todo supprimer marginLine et lui donnée comme argument.
       * 
       * Regarde si un point est sur une ligne verticale avec une marge (marginLine = 10).
       * S'il est exactement sur la ligne alors met la propriété isPile a true.
       * 
       * @param item
       * @param comparitor
       * @param {int} tol : tolérance en pixel.
       * @returns {Array} un tableau d'objet {y: de la ligne, isPile: {boolean}}
       */
      pointInVertligne: function (item, comparitor, tol) {
        tol = tol || 0;
        var tab = [], k;
        var ipos = [], cpos = [];
        var i, c;
        
        ipos.push(item.getTop());
        ipos.push(item.getCenterY());
        ipos.push(item.getBottom());

        cpos.push(comparitor.getTop());
        cpos.push(comparitor.getCenterY());
        cpos.push(comparitor.getBottom());

        for (i = 0; i < 3; i++) {
          for (c = 0; c < 3; c++) {
            if (this.betweenStrict(cpos[c] - tol, ipos[i], cpos[c] + tol)) {
              k = tab.push({y: cpos[c]});
              if (ipos[i] === cpos[c]) {
                tab[k - 1].isPile = true;
              }
            }
          }
        }
        return tab;
      },

      /**
       * @todo supprimer marginLine et lui donnée comme argument.
       *
       * Regarde si un point est sur une ligne horizontale avec une marge (marginLine = 10).
       * S'il est exactement sur la ligne alors met la propriété isPile a true.
       *
       * @param item
       * @param comparitor
       * @param tol : tolérance en pixel.
       * @returns {Array} un tableau d'objet {y: de la ligne, isPile: {boolean}}
       */
      pointInHoriligne: function (item, comparitor, tol) {
        tol = tol || 0;
        var tab = [], k;
        var ipos = [], cpos = [], i, c;

        ipos.push(item.getLeft());
        ipos.push(item.getCenterX());
        ipos.push(item.getRight());

        cpos.push(comparitor.getLeft());
        cpos.push(comparitor.getCenterX());
        cpos.push(comparitor.getRight());

        for (i = 0; i < 3; i++) {
          for (c = 0; c < 3; c++) {
            if (this.betweenStrict(cpos[c] - tol, ipos[i], cpos[c] + tol)) {
              k = tab.push({x: cpos[c]});
              if (ipos[i] === cpos[c]) {
                tab[k - 1].isPile = true;
              }
            }
          }
        }
        return tab;
      },

      /**
       * Regarde si un point est dans un rectangle a une tolérance près en pixel donnée par tol..
       * 
       * @param x
       * @param y
       * @param left
       * @param top
       * @param right
       * @param bottom
       * @param tol : tolérance en pixel.
       * @returns {boolean}
       */
      pointInRect: function (x, y, left, top, right, bottom, tol) {
        tol = tol || 0;
        return (this.between(left-tol, x, right+tol) && this.between(top-tol, y, bottom+tol));
      },

      /**
       * Regarde si un point est sur les bords d'un rectangle a une tolérance près en pixel donnée par tol.
       *
       * @param x
       * @param y
       * @param left
       * @param top
       * @param right
       * @param bottom
       * @param tol : tolérance en pixel.
       * @returns false or {pos:'top,bottom..' , type :'Type de pointeur souris'}
       */
      pointOnRect: function (x, y, left, top, right, bottom, tol) {
        tol = tol || 0;
        if (this.between(left - tol, x, right + tol)) {
          if (this.between(top - tol, y, top + tol)) {
            return {pos: 'top', type: 'ns-resize'};
          }
          else if (this.between(bottom - tol, y, bottom + tol)) {
            return {pos: 'bottom', type: 'ns-resize'};
          }
        }
        if (this.between(bottom - tol, y, top + tol)) {
          if (this.between(left - tol, x, left + tol)) {
            return {pos: 'left', type: 'ew-resize'};
          }
          else if (this.between(right - tol, x, right + tol)) {
            return {pos: 'right', type: 'ew-resize'};
          }
        }
        return false;
      },

      /**
       * Point dans cercle ?
       * @param shape
       * @param comparitor
       * @returns {boolean}
       */
      pointInCircle: function (shape, comparitor) {
        var dx = shape.getX() - comparitor.getCenterX();
        var dy = shape.getY() - comparitor.getCenterY();
        return (Math.sqrt(dx * dx + dy * dy) <= comparitor.getRadius());
      },

      /**
       * Cercle dans cercle ?
       * @param shape
       * @param comparitor
       * @returns {boolean}
       */
      circleInCircle: function (shape, comparitor) {
        var dx = shape.getCenterX() - comparitor.getCenterX();
        var dy = shape.getCenterY() - comparitor.getCenterY();
        return (Math.sqrt(dx * dx + dy * dy) <= shape.getRadius() + comparitor.getRadius());
      },

      /**
       * Rectangle dans rectangle ?
       * @param shape
       * @param comparitor
       * @returns {boolean}
       */
      rectInRect: function (shape, comparitor) {
        return (
          shape.getX() < comparitor.getX() + comparitor.size.w.v &&
          shape.getX() + shape.size.w.v > comparitor.getX() &&
          shape.getY() < comparitor.getY() + comparitor.size.h.v &&
          shape.size.h.v + shape.getY() > comparitor.getY()
        );
      },

      /**
       * Rectangle dans cercle.
       * @param shape
       * @param comparitor
       * @returns {boolean}
       */
      rectInCircle: function (shape, comparitor) {
        var circle, rect;

        if (shape.constructor.name === "Cercle") {
          circle = shape;
          rect = comparitor;
        }
        else {
          rect = shape;
          circle = comparitor;
        }

        var distX = Math.abs(circle.getCenterX() - rect.getX() - rect.size.w.v / 2);
        var distY = Math.abs(circle.getCenterY() - rect.getY() - rect.size.h.v / 2);

        if (distX > (rect.size.w.v / 2 + circle.getRadius())) {
          return false;
        }
        if (distY > (rect.size.h.v / 2 + circle.getRadius())) {
          return false;
        }

        if (distX <= (rect.size.w.v / 2)) {
          return true;
        }
        if (distY <= (rect.size.h.v / 2)) {
          return true;
        }

        var dx = distX - rect.size.w.v / 2;
        var dy = distY - rect.size.h.v / 2;
        return (dx * dx + dy * dy <= (circle.getRadius() * circle.getRadius()));
      },

      /**
       * @todo a supprimer je pense car ne fonctionne pas pour l'instant.
       * 
       * Cercle dans un poly.
       * @param shape
       * @param comparitor
       * @returns {boolean}
       */
      circleInPoly: function(shape, comparitor){
        var mecount = 0, cou = 0;
        cou = 0;
        mecount = 0;
        for (var counter = 0, l = recpoints.length; counter <= l - 1; counter++) {

          var pointA = recpoints[counter];
          if (counter == l - 1) {
            var pointB = recpoints[0];
          }
          else {
            var pointB = recpoints[counter + 1];
          }

          var X = pointB.pos.x - pointA.pos.x;
          var Y = pointB.pos.y - pointA.pos.y;

          if (X == 0) {
            var xprim = pointB.pos.x;
            var yprim = circle.pos.y;
            var norm = Math.abs(circle.pos.x - pointB.pos.x);
            if (norm < circle.getRadius()) {
              mecount = mecount + 1;
              if (this.between(pointA.pos.y, yprim, pointB.pos.y)) {
                return true;
              }
            }
          }
          else if (Y == 0) {
            var xprim = circle.pos.x;
            var yprim = pointB.pos.y;
            var norm = Math.abs(circle.pos.y - pointB.pos.y);
            if (norm < circle.getRadius()) {
              mecount = mecount + 1;
              if (this.between(pointA.pos.x, xprim, pointB.pos.x)) {
                return true;
              }
            }
          }
          else {
            var coefdir = Y / X;
            var oo = coefdir * pointA.pos.x - pointA.pos.y;
            var xprim = (X * circle.pos.x + Y * circle.pos.y - Y * oo) / (X + Y * coefdir);
            var yprim = coefdir * xprim + oo;
            var norm = Math.sqrt((xprim - circle.pos.x) * (xprim - circle.pos.x) + (yprim - circle.pos.y) * (yprim - circle.pos.y));
          }
        }
        return (mecount >= 1 && cou >= 1);
      }
    

    };
    
  }
);