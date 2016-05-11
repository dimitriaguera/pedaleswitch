'use strict';
(function() {

  class ModalBox {
    constructor($uibModalInstance, saved) {
      this.$uibModalInstance = $uibModalInstance;
      this.saved = saved;
  };

    ok(selected) {
      this.$uibModalInstance.close(selected);
    };

    cancel() {
      this.$uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('pedaleswitchApp')
    .controller('ModalBox', ModalBox);


//angular.module('pedaleswitchApp')
//  .controller('ModalBox', function ($scope, $uibModalInstance) {
//
//  $scope.ok = function (selected) {
//    $uibModalInstance.close(selected);
//  };
//
//  $scope.cancel = function () {
//    $uibModalInstance.dismiss('cancel');
//  };
//});

})();