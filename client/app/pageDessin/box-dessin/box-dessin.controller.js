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
          datachange: '&',
          items: '<',
          boxAction: '&',
          rotate: '&',
          eyedropper: '&'
        },
        controller: function ($scope) {

          this.onBlur = function(){
            $timeout.cancel(this.mypromise);
            this.store_value = this.value;
            this.value = null;
            var self = this;
            this.mypromise = $timeout(function(){ self.change = false; }, 200, self);
          };

          this.$onInit = function () {
            // Si l'objet n'est pas un arrow, on ajoute une pos_box, et on ajoute un template pour la popover.
            if (this.data.constructor.name !== "Arrow" && this.data.constructor.name !== "ArrowPoint") {

              var posExt = this.data.findExtreme();
              var C = this.data.getCenter();

              // On calcule le point de référence du masque carré.
              this.data.pos_box = {
                x: C.x - posExt.size.w / 2,
                y: C.y - posExt.size.h / 2
              };

              this.zIndex = '-2';
              this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover.html';
            }
            // Si l'objet est un Arrow, on remonte le z-index.
            else {
              this.zIndex = '2';
            }
          };

          this.$onDestroy = function() {
            // Si l'objet n'est pas un arrow, on détruit sa pos_box.
            if (this.data.constructor.name !== "Arrow") {
              delete this.data.pos_box;
            }
          };

          this.onFocus = function () {
            if (this.mypromise) {
              $timeout.cancel(this.mypromise);
            }
            this.value = this.store_value = this.data.value;
            this.change = true;
          };

          this.validation = function () {
            if (this.store_value) {
              this.data.setValue(this.store_value);
            }
            this.change = false;
            this.value = this.store_value = null;
            this.boxAction();
          };

        },
        controllerAs: '$ctrl'
      }

    });

})();