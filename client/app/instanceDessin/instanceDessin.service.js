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
          in_canvas: effet.in_canvas || false,
          titre: effet.titre,
          titre_option: option.titre,
          description: effet.description,
          description_option: option.description,
          prix: option.prix,
          size: Object.assign({}, option.size),
          pos: {
            x: 20,
            y: 20
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
            pos_default: Object.assign({}, option.composants[i].pos),
            pos: {
              x: option.composants[i].pos.x + nouvEffet.pos.x,
              y: option.composants[i].pos.y + nouvEffet.pos.y
            },
            id_item: composantItems[option.composants[i].available_compo_id[0]]._id,
            shape: composantItems[option.composants[i].available_compo_id[0]].shape,
            titre_item: composantItems[option.composants[i].available_compo_id[0]].titre,
            size: Object.assign({}, composantItems[option.composants[i].available_compo_id[0]].size),
            prix_add: composantItems[option.composants[i].available_compo_id[0]].prix_additionnel
          };
        }
        dessin.options.push(nouvEffet);
      },

      updateComposant: function(idOption, idCompo, idItem) {
        var data = {
          titre_item: composantItems[idItem].titre,
          size: composantItems[idItem].size,
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
