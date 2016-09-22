'use strict';
(function(){

angular.module('pedaleswitchApp')
    .directive('panelLeft', function(){
      return {
          restrict: 'A',
          transclude: {
              'headerSlot': 'panelhead'
          },
          template: '<span class="panelLeftButton">' +
          '<i class="glyphicon glyphicon-chevron-left"></i>' +
          '</span>'+
          '<div class="shadow-cont">' +
          '<div class="panelLeft-header" ng-transclude="headerSlot"></div>' +
          '<div class="panelLeft-container-content">' +
          '<div class="panelLeft-content">' +
          '<ng-transclude></ng-transclude>' +
          '</div></div></div>',

          link: function (scope, element) {

              var btn = element.find('.panelLeftButton');
              var ico = element.find('.glyphicon');

              element.addClass('panelLeftDefaultState');

              btn.on('click', function(event) {
                  event.preventDefault();
                  element.toggleClass('panelLeft-hide');
                  ico.toggleClass('glyphicon-chevron-left, glyphicon-chevron-right');

              });


          },
      };
    });

})();