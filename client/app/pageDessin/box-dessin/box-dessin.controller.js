'use strict';
(function(){

  angular.module('pedaleswitchApp')
    .directive('boxDessin', function ($timeout) {
      
      return {
        restrict: 'EA',
        transclude: true,
        templateUrl: 'app/pageDessin/box-dessin/box-dessin.html',
        bindToController: {
          data: '=',
          boxAction: '&'
        },
        controller: function () {
          this.onBlur = function(){
            $timeout.cancel(this.mypromise);
            this.store_value = this.value;
            this.value = null;
            var isThis = this;
            this.mypromise = $timeout(function(){ isThis.change = false; }, 120, isThis);
          };
          this.onFocus = function () {
            if (this.mypromise) {
              $timeout.cancel(this.mypromise);
            }
            this.value = this.store_value = this.data.value;
            this.change = true;
          };
          this.validation = function (){
            if (this.store_value) {
              this.data.setValue(this.store_value);
            }
            this.change = false;
            this.value = this.store_value = null;
            this.boxAction();
          };
        },
        controllerAs: '$ctrl',
      }

    });

})();