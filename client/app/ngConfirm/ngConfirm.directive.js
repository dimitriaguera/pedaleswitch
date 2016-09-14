'use strict';

angular.module('pedaleswitchApp')
  .directive('ngConfirm',['$uibModal', function ($uibModal) {
        return {
            restrict: 'A',
            scope: {
                ngConfirmMessage: '@',
                ngConfirmBody: '@',
                ngConfirm: '&'
            },
            link: function (scope, element) {
                element.bind('click', function () {
                    var modalInstance = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">{{confirmMessage}}</h3></div>' +
                                  '<div class="modal-body">{{confirmBody}}</div>' +
                                  '<div class="modal-footer">' +
                                  '<button class="btn btn-primary" type="button" ng-click="ok()">Confirmer</button>' +
                                  '<button class="btn btn-warning" type="button" ng-click="cancel()">Annuler</button></div>',
                        controller: 'ModalConfirmCtrl',
                        size: 'sm',
                        windowClass: 'confirm-window',
                        resolve: {
                            confirmClick: function () {
                                return scope.ngConfirm;
                            },
                            confirmMessge: function () {
                                return scope.ngConfirmMessage;
                            },
                            confirmBod: function () {
                                return scope.ngConfirmBody;
                            },
                        }
                    });
                });
            }
        }
    }])
    .controller('ModalConfirmCtrl', ['$scope', '$uibModalInstance', 'confirmClick', 'confirmMessge', 'confirmBod',
        function ($scope, $uibModalInstance, confirmClick, confirmMessge, confirmBod) {
            $scope.confirmMessage = confirmMessge;
            $scope.confirmBody = confirmBod;
            function closeModal() {
                $uibModalInstance.dismiss('cancel');
            }

            $scope.ok = function () {
                confirmClick();
                closeModal();
            }

            $scope.cancel = function () {
                closeModal();
            }
        }]);