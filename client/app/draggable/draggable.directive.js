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


            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('data', JSON.stringify(sc.effet));
            this.classList.add('drag');
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
