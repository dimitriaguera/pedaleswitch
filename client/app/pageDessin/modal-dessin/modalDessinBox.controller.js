'use strict';
(function() {

  class ModalDessinBox {
    constructor($uibModalInstance, data, items, selected) {
      this.$uibModalInstance = $uibModalInstance;
      this.data = data;
      this.items = items;
      this.selected = selected;
    }

    ok() {
      this.$uibModalInstance.close(this.selected);
    }

    cancel() {
      this.$uibModalInstance.dismiss('cancel');
    }
  }

  angular.module('pedaleswitchApp')
    .controller('ModalDessinBox', ModalDessinBox);



})();