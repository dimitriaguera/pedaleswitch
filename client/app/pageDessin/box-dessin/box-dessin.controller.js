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
          actions: '=',
          items: '<',
        },
        controller: function ($scope) {

          this.onBlur = function(){
            $timeout.cancel(this.mypromise);
            this.storeValue = this.value;
            this.value = null;
            var self = this;
            this.mypromise = $timeout(function(){ self.change = false; }, 200, self);
          };

          this.$onInit = function () {

            // Si l'objet n'est pas un arrow, on ajoute une posBox, et on ajoute un template pour la popover.
            if (this.data.constructor.name !== 'Arrow' && this.data.constructor.name !== 'ArrowPoint') {

              this.data.posBox = this.data.getBoxPos();

              this.zIndex = '-2';

              // on cherche le bon template.
              switch(this.data.fonction){
                case 'effet':
                  this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-effet.html';
                  break;
                case 'composant':
                  this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-composant.html';
                  break;
                case 'texte':
                  this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-texte.html';
                  break;
                case 'image':
                  this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-image.html';
                  break;
                case 'forme':
                  this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-forme.html';
                  break;
              }
            }
            // Si l'objet est un Arrow, on remonte le z-index.
            else {
              this.zIndex = '2';
            }
          };

          this.$onDestroy = function() {
            // Si l'objet n'est pas un arrow, on détruit sa posBox.
            if (this.data.constructor.name !== 'Arrow') {
              delete this.data.posBox;
            }
          };

          this.onFocus = function () {
            if (this.mypromise) {
              $timeout.cancel(this.mypromise);
            }
            this.value = this.storeValue = this.data.value;
            this.change = true;
          };

          this.validation = function () {
            if (this.storeValue) {
              this.data.setValue(this.storeValue);
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