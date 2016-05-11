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
    templateUrl: 'app/addeffet/modalComposants/modalBox.html',
    controller: 'ModalBox',
    controllerAs: 'modal',
    resolve: {
      saved: function () {
        return thisOne.oneComposant.available_compo_id;
      }
    },
    size: size,
  });
  this.modalInstance.result.then(function (selectedItems) {
      thisOne.oneComposant.available_compo_id = selectedItems;
    }, function () {
      alert('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('pedaleswitchApp')
  .component('modalComposants', {
    templateUrl: 'app/addeffet/modalComposants/modalComposants.html',
    controller: ModalComposants,
    bindings: {
      oneComposant: '=',
    },
  });

})();
