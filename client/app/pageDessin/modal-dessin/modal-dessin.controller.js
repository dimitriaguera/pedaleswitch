'use strict';
(function(){

  class ModalDessin {
    constructor($uibModal) {
      this.modalServ = $uibModal;
    }

    open(size) {
      var thisOne = this;
      this.modalInstance = this.modalServ.open({
        animation: true,
        templateUrl: 'app/pageDessin/modal-dessin/modalBox.html',
        controller: 'ModalDessinBox',
        controllerAs: 'modal',
        resolve: {
          data: function () {
            return thisOne.data;
          },
          items: function () {
            return thisOne.items;
          },
          selected: function () {
            return thisOne.selected;
          }
        },
        size: size,
      });
      this.modalInstance.result.then(function (selected) {
        thisOne.action({compo:thisOne.data, value:selected});
      });
    }

  }

  angular.module('pedaleswitchApp')
    .component('modalDessin', {
      templateUrl: 'app/pageDessin/modal-dessin/modal-dessin.html',
      bindings: {
        data: '<',
        items: '<',
        selected: '<',
        action: '&'
      },
      controller: ModalDessin
    });

})();