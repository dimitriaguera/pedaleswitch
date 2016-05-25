'use strict';

angular.module('pedaleswitchApp')
  .factory('checkCollision', function () {
    
    return {

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

      checkmousebox: function(mouse, items, tolerance) {
        var indexCounter,
          outer = items.length,
          comparitor;

        var intersect = new this.intersectHelper();

        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          comparitor.setSelected(false);
          if (intersect.pointInRect(mouse.x, mouse.y, comparitor.getLeft() - tolerance, comparitor.getTop() - tolerance, comparitor.getRight() + tolerance, comparitor.getBottom() + tolerance)) {
            comparitor.setSelected(true);
            return {id:indexCounter, dx:mouse.x - comparitor.getCenterX(),dy:mouse.y - comparitor.getCenterY()} ;
          }
        }
        return false;
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
  
        this.pointInRect = function(x, y, left, top, right, bottom) {
          return (this.between(left, x, right) && this.between(top, y, bottom));
        };

        this.pointInCircle = function(shape, comparitor){
          var dx = shape.pos.x - comparitor.getCenterX();
          var dy = shape.pos.y - comparitor.getCenterY();
          return (Math.sqrt(dx * dx + dy * dy) <= comparitor.getRadius());
        };
                
        this.circleInCircle = function(shape, comparitor){
          var dx = shape.pos.x - comparitor.pos.x;
          var dy = shape.pos.y - comparitor.pos.y;
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