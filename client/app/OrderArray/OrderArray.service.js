'use strict';

angular.module('pedaleswitchApp')
  .factory('OrderArray', function () {
    return {
      order: function(array) {
        var arrayTrie = {};
        array.forEach(function (element, index, array) {
          if (typeof this[element.type] != "undefined") {
            this[element.type].push(element);
          }
          else {
            this[element.type] = [];
            this[element.type][0] = element;
          }
        }, arrayTrie);
        return arrayTrie;
      }
    };
  });
