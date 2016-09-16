'use strict';
(function(){

  angular.module('pedaleswitchApp')
    .directive('boxDessin', function () {
      
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

          this.$onInit = function () {

            // Si l'objet n'est pas un arrow, on ajoute une posBox, et on ajoute un template pour la popover.
            if (this.data.fonction !== 'Arrow' && this.data.fonction !== 'ArrowPoint') {

             // this.data.posBox = this.data.getBoxPos();
              this.zIndex = '-2';

              // on cherche le bon template.
              switch(this.data.fonction){
                case 'Effet':
                  this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-effet.html';
                  break;
                case 'Composant':
                  this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-composant.html';
                  break;
                case 'deco':
                  switch (this.data.type) {
                    case 'text':
                      this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-text.html';
                      break;
                    case 'shape':
                      this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-shape.html';
                      break;
                    case 'img':
                      this.popUpUrl = 'app/pageDessin/box-dessin/option-box-popover-img.html';
                      break;
                  }
              }
            }
            // Si l'objet est un Arrow, on remonte le z-index.
            else {
              this.zIndex = '2';
            }
          };

          //this.$onDestroy = function() {
          //  // Si l'objet n'est pas un arrow, on détruit sa posBox.
          //  if (this.data.fonction !== 'Arrow') {
          //    delete this.data.posBox;
          //  }
          //};

        },
        controllerAs: '$ctrl'
      };

    });

})();