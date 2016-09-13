'use strict';
(function(){

class ModalComposants {
  constructor($http, $uibModal) {
    this.$http = $http;
    this.modalServ = $uibModal;
    this.selected = [];
  }

  open(size) {
    var thisOne = this;
    this.modalInstance = this.modalServ.open({
      animation: true,
      templateUrl: 'app/effet/modalComposants/modalBox.html',
      controller: 'ModalBox',
      controllerAs: 'modal',
      resolve: {
          saved: function () {
            return thisOne.oneComposant.available_compo_id;
          }
        },
      size: size
    });

    this.modalInstance.result.then(
      function (selectedItems) {
        thisOne.oneComposant.available_compo_id = selectedItems;
      },
      function () {
        window.alert('Modal dismissed at: ' + new Date());
      });
  }
}

angular.module('pedaleswitchApp')
  .component('modalComposants', {
    templateUrl: 'app/effet/modalComposants/modalComposants.html',
    controller: ModalComposants,
    bindings: {
      oneComposant: '='
    }
  });

})();
