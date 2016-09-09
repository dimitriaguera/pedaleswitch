'use strict';
(function(){

  class ModalDessin {
    constructor($uibModal) {
      this.modalServ = $uibModal;
    }

    open(size) {
      var self = this;
      this.modalInstance = this.modalServ.open({
        animation: true,
        templateUrl: function() {
          return 'app/pageDessin/modal-dessin/' + self.template + '.html' || 'app/pageDessin/modal-dessin/modalBox.html';
        },
        controller: 'ModalDessinBox',
        controllerAs: 'modal',
        resolve: {
          data: function () {
            return self.data;
          },
          items: function () {
            return self.items;
          },
          selected: function () {
            return self.selected;
          }
        },
        size: size,
      });
      this.modalInstance.result.then(function (selected) {
        self.action({compo:self.data, value:selected});
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
        template: '@',
        name: '@',
        classBtn: '@',
        action: '&'
      },
      controller: ModalDessin
    });

})();