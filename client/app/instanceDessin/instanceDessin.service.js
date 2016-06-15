'use strict';

angular.module('pedaleswitchApp')
  .factory('instanceDessin', function ($http, canvasConversion) {
    var initialCompo = [];
    var composantItems = {};
    var dessin = {
      options: [],
      boite: {}
    };


    /**
     * Retour les coordonnées des quatres sommet de la forme.
     * @param size
     * @param pos
     */
    function getPoints (size, pos) {
      return [
        {
          x: {v: pos.x - size.w/2},
          y: {v: pos.y - size.h/2}
        },
        {
          x: {v: pos.x + size.w/2},
          y: {v: pos.y - size.h/2}
        },
        {
          x: {v: pos.x + size.w/2},
          y: {v: pos.y + size.h/2}
        },
        {
          x: {v: pos.x - size.w/2},
          y: {v: pos.y + size.h/2}
        }
      ];
    }

    /**
     * @todo charger juste les composants des effets ajouter.
     *
     * Créer un tableau associatif composantItems de TOUS les composants existant dans la db.
     * La clé de chq entrée du tableau est l'id de chq composant.
     */
    $http.get('/api/composants').then(response => {
      initialCompo = response.data;
      for(var j=0; j<initialCompo.length; j++){
        composantItems[initialCompo[j]._id] = initialCompo[j];
      }
    });


    return {

      reset: function() {
        dessin.options = [];
        dessin.boite = {};
      },
      
      getDessin: function () {
        return dessin;
      },

      setDessin: function(newdessin) {
        dessin = newdessin;
        return dessin;
      },
      
      setBoite: function (boite) {
        dessin.boite = boite;
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

      /**
       * Ajoute un effet dans l'instance dessin.
       * Cette fonction est appelé quand on visite la bibliothèque et que
       * l'on ajoute l'effet au panier en cliquant sur +.
       *
       * @param effet
       * @param option
       */
      setEffet: function(effet, option) {
        var key = dessin.options.length;
        var nouv_effet = {
          _id: option._id,
          key: key,
          item_info : {shape: null},
          in_canvas: effet.in_canvas || false,
          titre: effet.titre,
          titre_option: option.titre,
          description: effet.description,
          description_option: option.description,
          prix: option.prix,
          size: {
            w: {v: option.size.w},
            h: {v: option.size.h},
            d: {v: option.size.d || null}
          },
          old_size: {
            w: {v: option.size.w},
            h: {v: option.size.h},
            d: {v: option.size.d || null}
          },
          //pos: {
          //  x: {v: option.pos.x || 20},
          //  y: {v: option.pos.y || 20},
          //  z: {v: option.pos.z || null}
          //},
          pos: {
            x: {v:  20},
            y: {v:  20},
            z: {v: 20}
          },
          points: getPoints(option.size, {x: 20 + option.size.w/2, y: 20 + option.size.h/2}),
          composants: []
        };
        for(var i=0; i<option.composants.length; i++){
          var compo = {
            _id: option.composants[i]._id,
            key: key,
            titre: option.composants[i].titre,
            titre_parent_effet: effet.titre,
            titre_parent_option: option.titre,
            pos_default: {
              x: {v: option.composants[i].pos.x},
              y: {v: option.composants[i].pos.y},
              z: {v: option.composants[i].pos.z || null}
            },
            pos: {
              x: {v: option.composants[i].pos.x + nouv_effet.pos.x.v},
              y: {v: option.composants[i].pos.y + nouv_effet.pos.y.v},
              z: {v: option.composants[i].pos.z + nouv_effet.pos.z.v}
            },
            size: {
              w: {v: composantItems[option.composants[i].available_compo_id[0]].size.w},
              h: {v: composantItems[option.composants[i].available_compo_id[0]].size.h},
              d: {v: composantItems[option.composants[i].available_compo_id[0]].size.d || null}
            },
            old_size: {
              w: {v: composantItems[option.composants[i].available_compo_id[0]].size.w},
              h: {v: composantItems[option.composants[i].available_compo_id[0]].size.h},
              d: {v: composantItems[option.composants[i].available_compo_id[0]].size.d || null}
            },
            points_default: getPoints(composantItems[option.composants[i].available_compo_id[0]].size, option.composants[i].pos),
            points: getPoints(composantItems[option.composants[i].available_compo_id[0]].size, option.composants[i].pos),
            item_info: {
              id_item: composantItems[option.composants[i].available_compo_id[0]]._id,
              items: option.composants[i].available_compo_id,
              shape: composantItems[option.composants[i].available_compo_id[0]].shape,
              titre_item: composantItems[option.composants[i].available_compo_id[0]].titre,
              prix_add: composantItems[option.composants[i].available_compo_id[0]].prix_additionnel
            }
          };
          nouv_effet.composants.push(compo);
        }
        canvasConversion.convertEffetSize(nouv_effet);
        canvasConversion.initializeEffetZoom(nouv_effet);
        dessin.options.push(nouv_effet);
      },

      // @todo a supprime ?
      //moveItem: function (item, x, y){
      //  item.pos.x = x;
      //  item.pos.y = y;
      //},

      zoomInitialize: function(value){
        canvasConversion.setZoom(value);
        for (var i = 0; i < dessin.options.length; i++) {
          canvasConversion.initializeEffetZoom(dessin.options[i]);
        }
      },

      zoomChange: function(value){
        var okZoom = canvasConversion.setZoom(value);
        if (okZoom) {
          if (dessin.boite.constructor.name === "MasterBoite") {
            canvasConversion.convertEffetZoom(dessin.boite);
          }
          for (var i = 0; i < dessin.options.length; i++) {
            canvasConversion.convertEffetZoom(dessin.options[i]);
          }
        }
        return okZoom;
      },

      //updateComposant: function(idOption, idCompo, idItem) {
      //  var data = {
      //    titre_item: composantItems[idItem].titre,
      //    size: composantItems[idItem].size,
      //    prix_add: composantItems[idItem].prix_additionnel
      //  };
      //  for(var i=0; i<dessin.options.length; i++){
      //    if(dessin.options[i]._id === idOption){
      //      for (var j = 0; j < dessin.options[i].composants.length; j++){
      //        if (dessin.options[i].composants[j]._id === idCompo){
      //          dessin.options[i].composants[j] = _.merge(dessin.options[i].composants[j], data);
      //          return;
      //        }
      //      }
      //    }
      //  }
      //}

      updateComposant: function(compo, value) {
        var data = {
            titre_item: composantItems[value].titre,
            id_item: composantItems[value]._id,
            size: composantItems[value].size,
            prix_add: composantItems[value].prix_additionnel,
            shape: composantItems[value].shape
        };
        compo = _.merge(compo.item_info, data);
      }



    };
  });