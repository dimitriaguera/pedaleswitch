'use strict';

angular.module('pedaleswitchApp')
  .factory('instanceDessin', function ($http, canvasConversion) {
    var initialCompo = [];
    var composantItems = {};
    var dessin = {
      options: [],
      boite: null
    };

    $http.get('/api/composants').then(response => {
      initialCompo = response.data;
      for(var j=0; j<initialCompo.length; j++){
        composantItems[initialCompo[j]._id] = initialCompo[j];
      }
    });


    return {

      reset: function() {
        dessin.options = [];
        dessin.boite = null;        
      },
      
      getDessin: function () {
        return dessin;
      },

      setDessin: function(newdessin) {
        return dessin = newdessin;
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

      moveItem: function (item, x, y){
        item.pos.x = x;
        item.pos.y = y;
      },

      setEffet: function(effet, option) {
        var key = dessin.options.length;
        var nouv_effet = {
          _id: option._id,
          key: key,
          in_canvas: effet.in_canvas || false,
          titre: effet.titre,
          titre_option: option.titre,
          description: effet.description,
          description_option: option.description,
          prix: option.prix,
          size: {
            w: option.size.w,
            h: option.size.h
          },
          pos: option.pos || {x: 20,y:  20},
          composants: []
        };
        for(var i=0; i<option.composants.length; i++){
          var compo = {
            _id: option.composants[i]._id,
            key: key,
            titre: option.composants[i].titre,
            items: option.composants[i].available_compo_id,
            pos_parent: nouv_effet.pos,
            pos_default: {
              x: option.composants[i].pos.x,
              y: option.composants[i].pos.y
            },
            pos: {
              x: option.composants[i].pos.x + nouv_effet.pos.x,
              y: option.composants[i].pos.y + nouv_effet.pos.y
            },
            size: {
              w: composantItems[option.composants[i].available_compo_id[0]].size.w,
              h: composantItems[option.composants[i].available_compo_id[0]].size.h
            },
            id_item: composantItems[option.composants[i].available_compo_id[0]]._id,
            shape: composantItems[option.composants[i].available_compo_id[0]].shape,
            titre_item: composantItems[option.composants[i].available_compo_id[0]].titre,
            prix_add: composantItems[option.composants[i].available_compo_id[0]].prix_additionnel
          };
          nouv_effet.composants.push(compo);
        }
        canvasConversion.convertEffetSize(nouv_effet);
        canvasConversion.initializeEffetZoom(nouv_effet);
        dessin.options.push(nouv_effet);
      },

      zoomInitialize: function(value){
        canvasConversion.setZoom(value);
        for (var i = 0; i < dessin.options.length; i++) {
          canvasConversion.initializeEffetZoom(dessin.options[i]);
        }
      },

      zoomChange: function(value){
        var okZoom = canvasConversion.setZoom(value);
        if (okZoom) {
          if (dessin.boite) {
            canvasConversion.convertEffetZoom(dessin.boite);
          }
          for (var i = 0; i < dessin.options.length; i++) {
            canvasConversion.convertEffetZoom(dessin.options[i]);
          }
        }
        return okZoom;
      },

      updateComposant: function(idOption, idCompo, idItem) {
        var data = {
          titre_item: composantItems[idItem].titre,
          size: composantItems[idItem].size,
          prix_add: composantItems[idItem].prix_additionnel
        };
        for(var i=0; i<dessin.options.length; i++){
          if(dessin.options[i]._id === idOption){
            for (var j = 0; j < dessin.options[i].composants.length; j++){
              if (dessin.options[i].composants[j]._id === idCompo){
                dessin.options[i].composants[j] = _.merge(dessin.options[i].composants[j], data);
                return;
              }
            }
          }
        }
      }
    };
  });
