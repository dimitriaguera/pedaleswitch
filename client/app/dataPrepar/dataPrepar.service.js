'use strict';

angular.module('pedaleswitchApp')
  .factory('dataPrepar', function () {

    return {

        // Formate l'objet effet pour l'envoie serveur.
        getDataEffet: function (entity){

            var data = {
              titre: entity.titre,
              description: entity.description,
              type: entity.type,
              options: []
            };

            if( entity._id ) {
                data._id = entity._id;
            }

            for(var i = 0; i < entity.options.length; i++){
                var opt = entity.options[i];
                var option = {
                    titre: opt.titre,
                    description: opt.description,
                    prix: opt.prix,
                    media: [],
                    size: {
                        w: opt.size.w,
                        h: opt.size.h
                    },
                    disponibilite: opt.disponibilite,
                    publie: opt.publie,
                    composants: []
                };

                if( opt._id ) {
                    option._id = opt._id;
                }

                if( opt.dateCreation ) {
                    option.dateCreation = opt.dateCreation;
                }

                for(var j = 0; j < opt.composants.length; j++) {
                    var comp = opt.composants[j];
                    var composant = {
                        type: comp.type,
                        titre: comp.titre,
                        available_compo_id: comp.available_compo_id,
                        pos: {
                            x: comp.pos.x,
                            y: comp.pos.y
                        }
                    };

                    if( comp._id ) {
                        composant._id = comp._id;
                    }

                    option.composants.push(composant);
                }
                data.options.push(option);
            }
            return data;
        },

        // Formate l'objet composant pour l'envoie serveur.
        getDataComposant: function (entity) {

            var data = {
                titre: entity.titre,
                type: entity.type,
                shape: entity.shape,
                description: entity.description,
                disponibilite: entity.disponibilite,
                publie: entity.publie,
                prix_additionnel: entity.prix_additionnel,
                size: {
                    w: entity.size.w,
                    h: entity.size.h
                },
                media: []
            };

            if( entity._id ) {
                data._id = entity._id;
            }
            if (data.shape === 'Cercle') {
                data.size.h = data.size.w;
            }

            return data;
        }
    };
  });
