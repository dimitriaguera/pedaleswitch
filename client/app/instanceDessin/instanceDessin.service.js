'use strict';

angular.module('pedaleswitchApp')
  .factory('instanceDessin', function ($http, canvasControl) {
    // Service logic
    // ...

    var initialCompo = [];
    var composantItems = {};
    var key = 0;
    var dessin = {
      options: [],
      boite: {}
    };

    $http.get('/api/composants').then(response => {
      initialCompo = response.data;
      for(var j=0; j<initialCompo.length; j++){
        composantItems[initialCompo[j]._id] = initialCompo[j];
      }
    });

    // Public API here
    return {

      getDessin: function () {
        return dessin;
      },

      getComposantItems: function () {
        return composantItems;
      },

      searchEffetInDessin: function(id, key){
        for(var i = 0; i < dessin.options.length; i++){
          if(dessin.options[i]._id === id && dessin.options[i].key === key){
            return dessin.options[i];
          }
        }
        return false;
      },

      moveItem: function (item, x, y){
        item.pos.x = x;
        item.pos.y = y;
      },

      setEffet: function(effet, option) {
        key ++;
        var nouvEffet = {
          _id: option._id,
          key: key,
          titre: effet.titre,
          titre_option: option.titre,
          description: effet.description,
          description_option: option.description,
          prix: option.prix,
          size: option.dimensions,
          pos: {
            x: 20,
            y:20
          },
          composants: {}
        };
        for(var i=0; i<option.composants.length; i++){
          nouvEffet.composants[option.composants[i]._id] = {
            _id: option.composants[i]._id,
            key: key,
            titre: option.composants[i].titre,
            items: option.composants[i].available_compo_id,
            pos_parent: nouvEffet.pos,
            pos_default: option.composants[i].coordonnees,
            pos: {
              x: option.composants[i].coordonnees.x + nouvEffet.pos.x,
              y: option.composants[i].coordonnees.y + nouvEffet.pos.y
            },
            id_item: composantItems[option.composants[i].available_compo_id[0]]._id,
            titre_item: composantItems[option.composants[i].available_compo_id[0]].titre,
            size: composantItems[option.composants[i].available_compo_id[0]].dimensions,
            prix_add: composantItems[option.composants[i].available_compo_id[0]].prix_additionnel
          };
          //nouvEffet.composants[option.composants[i]._id].coord.x = 100;
        }
        dessin.options.push(nouvEffet);
      },

      updateComposant: function(idOption, idCompo, idItem) {
        var data = {
          titre_item: composantItems[idItem].titre,
          dimensions: composantItems[idItem].dimensions,
          prix_add: composantItems[idItem].prix_additionnel
        };
        for(var i=0; i<dessin.options.length; i++){
          if(dessin.options[i]._id === idOption){
            dessin.options[i].composants[idCompo] = _.merge(dessin.options[i].composants[idCompo], data);
            return;
          }
        }
      }
    };
  });
