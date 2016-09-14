'use strict';

angular.module('pedaleswitchApp')
  .factory('dataPrepar', function () {

    return {
        getDataEffet: function (entity){

           // var data = angular.fromJson(angular.toJson(entity));
            //angular.copy(entity, data);

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
                    option.composants.push(composant);
                }
                data.options.push(option);
            }
            return data;
        }
    };
  });
