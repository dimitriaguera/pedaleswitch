'use strict';

angular.module('pedaleswitchApp')
  .factory('checkCollision', function () {


    var marginLine = 10;

    return {

      /**
       * Check la collision entre un thing et un tableau de thing.
       * @param item
       * @param items
       */
      check: function(item, items) {
        var indexCounter,
          outer = items.length,
          comparitor;

        item.setOverlapping(false);

        var intersect = new this.intersectHelper();
        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          if (!(item._id == comparitor._id && item.key == comparitor.key)){
            comparitor.setOverlapping(false);
            if (intersect.check(item, comparitor) === true) {
              item.setOverlapping(true);
              comparitor.setOverlapping(true);
            }
          }
        }
      },

      /**
       * Check la collision entre tout les things d'un tableau.
       * @param items
       */
      checkall: function (items) {
        var intersect = new this.intersectHelper();
        var indexCounter,
            renderCounter,
            outer = items.length,
            inner = items.length,
            item;
        
        //@todo to improve car il check 2 fois les memes objets.
        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          item = items[indexCounter];
          items[indexCounter].setOverlapping(false);
  
          for (renderCounter = 0; renderCounter < inner; renderCounter++) {
            if (indexCounter !== renderCounter) {
              var comparitor = items[renderCounter];
              if (intersect.check(item, comparitor) === true) {
                items[renderCounter].setOverlapping(true);
                items[indexCounter].setOverlapping(true);
              }
            }
          }
        }
      },


      /**
       * Check la collision entre la souris et un tableau de thing avec un tolérance en pixel donnée.
       * @param mouse object contenant x,y
       * @param items
       * @param tolerance
       * @returns {*}
       */
      checkmousebox: function(mouse, items, tolerance) {
        var indexCounter,
          outer = items.length,
          comparitor;

        var intersect = new this.intersectHelper();
        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          if (intersect.pointInRect(mouse.x, mouse.y, comparitor.getLeft() - tolerance, comparitor.getTop() - tolerance, comparitor.getRight() + tolerance, comparitor.getBottom() + tolerance)) {
            return {id:indexCounter, dx:mouse.x - comparitor.getCenterX(),dy:mouse.y - comparitor.getCenterY()} ;
          }
        }
        return false;
      },

      /**
       * Permet de voir si le centre de l'obj deplace est aligné avec le centre des obj actifs.
       * 
       * @param item
       * @param items
       * @returns {{x: Array, y: Array, isPile: Bool}}
       */
      checkLine: function(item, items) {
        var indexCounter,
          outer = items.length,
          comparitor;
        var tab = {x: [], y: []}, k;
        
        var intersect = new this.intersectHelper();
        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          if (!(item._id == comparitor._id && item.key == comparitor.key)){

            tab.y = tab.y.concat(intersect.pointInVertligne2(item,comparitor));
            tab.x = tab.x.concat(intersect.pointInHoriligne2(item,comparitor));
            /*
            if (intersect.pointInHoriligne(item, comparitor) === true) {
              k = tab.x.push({x: comparitor.getCenterX()});
              if (comparitor.getCenterX() === item.getCenterX()){
                tab.x[k-1].isPile = true;
              }
            }
            */

          }
        }
        return tab;
      },
            
      intersectHelper: function () {
  
        this.between = function (min, p, max) {
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
  
          if (p == min || p == max) {
            result = true;
          }
  
          return result;
        };


        this.betweenstrict = function (min, p, max) {
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
        };

        this.pointInVertligne2 = function(item, comparitor) {
          var tab = [], k;
          var ipos = [], cpos = [], i, c;

          ipos.push(item.getTop());
          ipos.push(item.getCenterY());
          ipos.push(item.getBottom());

          cpos.push(comparitor.getTop());
          cpos.push(comparitor.getCenterY());
          cpos.push(comparitor.getBottom());

          for (i = 0; i < 3; i++) {
            for (c = 0; c < 3; c++) {
              if (this.betweenstrict(cpos[c] - marginLine, ipos[i], cpos[c] + marginLine)) {
                k = tab.push({y: cpos[c]});
                if (ipos[i] === cpos[c]) {
                  tab[k - 1].isPile = true;
                }
              }
            }
          }
          return tab;
        };

        this.pointInHoriligne2 = function(item, comparitor){
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
              if (this.betweenstrict(cpos[c] - marginLine, ipos[i], cpos[c] + marginLine)) {
                k = tab.push({x: cpos[c]});
                if (ipos[i] === cpos[c]) {
                  tab[k - 1].isPile = true;
                }
              }
            }
          }
          return tab;
        };


        this.pointInVertligne = function(item, comparitor){
          return this.between(comparitor.getCenterY()-marginLine,item.getCenterY(),comparitor.getCenterY()+marginLine) ;
        };

        this.pointInHoriligne = function(item, comparitor){
          return this.between(comparitor.getCenterX()-marginLine,item.getCenterX(),comparitor.getCenterX()+marginLine) ;
        };

        this.pointInRect = function(x, y, left, top, right, bottom) {
          return (this.between(left, x, right) && this.between(top, y, bottom));
        };

        this.pointInCircle = function(shape, comparitor){
          var dx = shape.pos.x - comparitor.getCenterX();
          var dy = shape.pos.y - comparitor.getCenterY();
          return (Math.sqrt(dx * dx + dy * dy) <= comparitor.getRadius());
        };
                
        this.circleInCircle = function(shape, comparitor){
          var dx = shape.getCenterX() - comparitor.getCenterX();
          var dy = shape.getCenterY() - comparitor.getCenterY();
          return (Math.sqrt(dx * dx + dy * dy) <= shape.getRadius() + comparitor.getRadius());
        };

        this.rectInRect = function(shape, comparitor) {
          // Recupère les coordonnées de la forme que l'on déplace.
          var points = shape.getBoundingBoxPoints();
          for (var counter = 0, l = points.length; counter < l; counter++) {
            var point = points[counter];
            if (this.pointInRect(point.x, point.y,
                comparitor.getLeft(), comparitor.getTop(),
                comparitor.getRight(), comparitor.getBottom()) === true) {
              return true;
            }
          }
          return false;
        };

        this.rectInCircle = function(shape, comparitor) {
          var circle, rect;
          
          if (shape.constructor.name === "Cercle") {
            circle = shape;
            rect = comparitor;
          }
          else {
            rect = shape;
            circle = comparitor;
          }
          
          var distX = Math.abs(circle.getCenterX() - rect.pos.x - rect.size.w / 2);
          var distY = Math.abs(circle.getCenterY() - rect.pos.y - rect.size.h / 2);

          if (distX > (rect.size.w / 2 + circle.getRadius())) {
            return false;
          }
          if (distY > (rect.size.h / 2 + circle.getRadius())) {
            return false;
          }

          if (distX <= (rect.size.w / 2)) {
            return true;
          }
          if (distY <= (rect.size.h / 2)) {
            return true;
          }

          var dx = distX - rect.size.w / 2;
          var dy = distY - rect.size.h / 2;
          return (dx * dx + dy * dy <= (circle.getRadius() * circle.getRadius()));
        };

        this.circleInPoly = function(shape, comparitor){
          var mecount = 0, cou=0;
          cou = 0;
          mecount=0;
          for (var counter = 0, l = recpoints.length; counter <= l-1; counter++) {

            var pointA = recpoints[counter];
            if (counter == l-1) {
              var pointB = recpoints[0];
            }
            else
            {
              var pointB = recpoints[counter+1];
            }



            var X = pointB.pos.x - pointA.pos.x;
            var Y = pointB.pos.y - pointA.pos.y;

            if (X == 0){
              var xprim = pointB.pos.x;
              var yprim = circle.pos.y;
              var norm = Math.abs(circle.pos.x - pointB.pos.x);
              if (norm < circle.getRadius()) {
                mecount = mecount+1;
                if (this.between(pointA.pos.y, yprim , pointB.pos.y)){
                  return true;
                }
              }
            }
            else if (Y == 0){
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
              var coefdir =  Y / X;
              var oo = coefdir * pointA.pos.x - pointA.pos.y;
              var xprim = (X * circle.pos.x + Y * circle.pos.y - Y*oo) / (X + Y*coefdir);
              var yprim = coefdir * xprim + oo;
              var norm = Math.sqrt((xprim - circle.pos.x)*(xprim - circle.pos.x) + (yprim - circle.pos.y)*(yprim - circle.pos.y));
            }
          }
          if ((mecount >=1 && cou >=1)){
            return true;
          }
          return false;
        };



        // Check si la forme que l'on déplace est dans une autre forme.
        this.check = function (shape, comparitor) {

          if (shape.constructor.name === "Rect" && comparitor.constructor.name === "Rect") {
            return this.rectInRect(shape, comparitor);
          }
          else if (shape.constructor.name === "Cercle" && comparitor.constructor.name === "Cercle") {
            return this.circleInCircle(shape, comparitor);
          }
          else {
            return this.rectInCircle(shape, comparitor);
          }
          // return this.circleInPoly(shape, comparitor);
        }

      }



    };
  }
);