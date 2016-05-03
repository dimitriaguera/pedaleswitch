'use strict';

angular.module('pedaleswitchApp')
  .directive('loading', function () {
    return {
      template: '<div></div>',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        element.text('this is the loading directive');
      }
    };
  });
