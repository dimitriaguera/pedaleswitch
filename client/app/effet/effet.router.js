'use strict';

angular.module('pedaleswitchApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('effets', {
                url: '/effets',
                template: '<effet></effet>'
            })
            .state('editionEffet', {
                url: '/edition-effet',
                template: '<editeffet></editeffet>',
                params: {
                    entity: null,
                    types: null,
                    nouv: null
                }
            })
            .state('editionTypeEffet', {
                url: '/edition-type-effet',
                template: '<addtype></addtype>',
            });
    });
