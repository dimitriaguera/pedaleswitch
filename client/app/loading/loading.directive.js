'use strict';

angular.module('pedaleswitchApp')
  .directive('loading3', function () {
    return {
      template: '<div><div ng-show="loading2" class="loading-container"></div><div ng-hide="loading2" ng-transclude></div></div>',
      restrict: 'A',
      transclude: true,
      replace: true,
      scope:{
        loading2: "=loading3"
      },

      compile: function (element, attrs, transclude){
        var loadingContainer = element.find(".loading-container")[0];
        var elem = document.createElement("img");
        elem.setAttribute("src", "assets/images/spin.gif");
        elem.setAttribute("height", "768");
        elem.setAttribute("width", "1024");
        elem.setAttribute("alt", "spin");
        loadingContainer.appendChild(elem);
        /*
         var spinner = new Spinner().spin();
         var loadingContainer = element.find(".loading-container")[0];
         loadingContainer.appendChild(spinner.el);
         */
      }

    };
  });
