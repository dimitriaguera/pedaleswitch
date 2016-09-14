'use strict';

angular.module('pedaleswitchApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('effets', {
                url: '/effets',
                template: '<effet></effet>',
                params: {
                    message: null
                }
            })
            .state('editionEffet', {
                url: '/edition-effet',
                template: '<editeffet></editeffet>',
                params: {
                    entity: null
                }
            })
            .state('typeEffet', {
                url: '/type-effet',
                template: '<addtype></addtype>',
                params: {
                    entity: null
                }
            })
            .state('editionTypeEffet', {
                url: '/edition-type-effet',
                template: '<addtype></addtype>',
            });
    });
