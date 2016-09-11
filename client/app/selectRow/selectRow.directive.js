'use strict';

angular.module('pedaleswitchApp')
  .directive('selectRow', function () {
      return {
          require: '^stTable',
          template: '<input type="checkbox"/>',
          scope: {
              row: '=selectRow'
          },
          link: function (scope, element, attr, ctrl) {

              element.bind('change', function (evt) {
                  scope.$apply(function () {
                      ctrl.select(scope.row, 'multiple');
                  });
              });

              scope.$watch('row.isSelected', function (newValue, oldValue) {
                  if (newValue === true) {
                      element.parent().addClass('bg-primary');
                  } else {
                      element.parent().removeClass('bg-primary');
                  }
              });
          }
      };
  });
