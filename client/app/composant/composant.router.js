'use strict';

angular.module('pedaleswitchApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('composants', {
                url: '/composants',
                template: '<composant></composant>',
                params: {
                    message: null
                }
            })
            .state('editionComposant', {
                url: '/edition-composant',
                template: '<editcomposant></editcomposant>',
                params: {
                    entity: null
                }
            })
            .state('typeComposant', {
                url: '/type-composant',
                template: '<addtypecompo></addtypecompo>',
                params: {
                    entity: null
                }
            });

    });