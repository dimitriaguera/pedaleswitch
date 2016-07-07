'use strict';
(function() {

  angular.module('pedaleswitchApp')
    .directive('boxArrow', function ($timeout) {

      return {
        restrict: 'EA',
        templateUrl: 'app/pageDessin/box-dessin/box-arrow/box-arrow.html',
        bindToController: {
          datas: '=',
          actions: '='
        },
        controller: function ($scope) {

          this.onBlur = function () {
            $timeout.cancel(this.mypromise);
            this.storeValue = this.value;
            this.value = null;
            var self = this;
            this.mypromise = $timeout(function () {
              self.change = false;
            }, 200, self);
          };

          this.$onInit = function () {
            this.zIndex = '2';
          };

          this.onFocus = function () {
            if (this.mypromise) {
              $timeout.cancel(this.mypromise);
            }
            this.value = this.storeValue = this.datas.value;
            this.change = true;
          };

          this.validation = function () {
            if (this.storeValue) {
              this.datas.setValue(this.storeValue);
            }
            this.change = false;
            this.value = this.storeValue = null;
            this.actions.arrowChangeValue();
          };

        },
        controllerAs: '$ctrl'
      };
    });
})();