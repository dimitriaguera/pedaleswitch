'use strict';

angular.module('pedaleswitchApp')
  .factory('checkCollision', function (intersect) {

    return {

      /**
       * @todo a supprimer
       * Check la collision entre un thing et un tableau de thing.
       * @param item
       * @param items
       */
      checktest: function(item, items) {
        var indexCounter,
          outer = items.length,
          comparitor;

        item.setOverlapping(false);

        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          if (!(item._id == comparitor._id && item.key == comparitor.key)) {
            comparitor.setOverlapping(false);
            if (intersect.polyInPoly(item, comparitor) === true) {
              item.setOverlapping(true);
              comparitor.setOverlapping(true);
            }
          }
        }
      },

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

        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          if (!(item._id == comparitor._id && item.key == comparitor.key)) {
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
      checkAll: function(items) {
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
      checkMouseBox: function(mouse, items, tolerance) {
        var indexCounter,
          outer = items.length,
          comparitor;

        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          if (intersect.pointInRect(mouse, comparitor.findExtreme(), tolerance)) {
            return {
              id: indexCounter, 
              dx: mouse.x - comparitor.getCenterX(),
              dy: mouse.y - comparitor.getCenterY()
            };
          }
        }
        return false;
      },

      checkPoly: function(mouse, items) {
        var indexCounter,
          outer = items.length,
          comparitor;
        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          if (intersect.pointInPoly(mouse, comparitor.points)) {
            return {
              id: indexCounter,
              dx: mouse.x - comparitor.getCenterX(),
              dy: mouse.y - comparitor.getCenterY()
            };
          }
        }
        return false;
        
      },
      
      
      
      /**
       * Check la collision entre la souris et un tableau de thing avec un tolérance en pixel donnée.
       * @param mouse object contenant x,y
       * @param items
       * @param tolerance
       * @returns {*}
       */
      checkMouseBorder: function(mouse, items, tolerance) {
        var indexCounter,
          outer = items.length,
          test,
          comparitor;

        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          test = intersect.pointOnRect(mouse, comparitor.findExtreme(), tolerance);
          if (test) {
            return {
              id: indexCounter,
              dx: mouse.x - comparitor.getCenterX(),
              dy: mouse.y - comparitor.getCenterY(),
              pointer: test
            };
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

        for (indexCounter = 0; indexCounter < outer; indexCounter++) {
          comparitor = items[indexCounter];
          if (!(item._id == comparitor._id && item.key == comparitor.key)) {

            tab.y = tab.y.concat(intersect.pointInVertligne(item, comparitor, 10));
            tab.x = tab.x.concat(intersect.pointInHoriligne(item, comparitor, 10));
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
      }
      
    };
    
  }
);