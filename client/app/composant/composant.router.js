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
            });

    });