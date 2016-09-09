'use strict';

angular.module('pedaleswitchApp')
  .directive('showErrors', function () {
    return {
        restrict: 'A',
        require:  '^form',
        link: function (scope, el, attrs, formCtrl) {
            // find the text box element, which has the 'name' attribute
            var inputEl = el[0].querySelector("[name]");
            // convert the native text box element to an angular element
            var inputNgEl = angular.element(inputEl);
            // get the name on the text box so we know the property to check
            // on the form controller
            var inputName = inputNgEl.attr('name');

            var icoYes = angular.element('<span class="hide glyphicon glyphicon-ok form-control-feedback"></span>');
            var icoNo = angular.element('<span class="hide glyphicon glyphicon-remove form-control-feedback"></span>');

            el.addClass('has-feedback');
            el.append(icoYes);
            el.append(icoNo);

            // only apply the has-error class after the user leaves the text box
            inputNgEl.bind('blur', function () {
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
                icoYes.toggleClass('hide', formCtrl[inputName].$invalid);

                el.toggleClass('has-success', formCtrl[inputName].$valid);
                icoNo.toggleClass('hide', formCtrl[inputName].$valid);
            });

            // si broadcast erreur lors de la validation ajout message d'erreur sur le champ.
            scope.$on('show-errors-check-validity', function() {
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
                icoYes.toggleClass('hide', formCtrl[inputName].$invalid);

                el.toggleClass('has-success', formCtrl[inputName].$valid);
                icoNo.toggleClass('hide', formCtrl[inputName].$valid);
            });
        }
    };
  });
