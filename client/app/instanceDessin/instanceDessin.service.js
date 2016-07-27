'use strict';

angular.module('pedaleswitchApp')
  .factory('instanceDessin', function ($http, canvasConversion) {
    var initialCompo = [];
    var composantItems = {};
    var dessin = {
      options: [],
      boite: {}
    };

    /*
    var polyTest = {
      _id: '11111',
      key: '555',
      shapeObject: 'Poly',
      titre: 'test poly',
      titreParentEffet: null,
      titreParentOption: null,
      pointsDefault: [
        {
          x: 50,         
          y: 50
        },
        {
          x: 60,
          y: 70
        },
        {
          x: 60,
          y: 80
        },
        {
          x: 30,
          y: 70
        }
      ],
      points: [
        {
          x: 50,
          y: 50
        },
        {
          x: 60,
          y: 70
        },
        {
          x: 60,
          y: 80
        },
        {
          x: 30,
          y: 70
        }
      ],
      pos: {
        x: null,
        y: null
      },
      posDefault: {
        x: null,
        y: null
      },
      size: {
        w: null,
        h: null,
        d: null
      },
      oldSize: {
        w: null,
        h: null,
        d: null
      },
      itemInfo: {
        shape: 'Rect'
      }
    };
     */
    /**
     * Retour les coordonnées des quatres sommet de la forme.
     * @param size
     * @param pos
     */
    function getPoints (size, pos) {
      return [
        {
          x: pos.x - size.w/2,
          y: pos.y - size.h/2
        },
        {
          x: pos.x + size.w/2,
          y: pos.y - size.h/2
        },
        {
          x: pos.x + size.w/2,
          y: pos.y + size.h/2
        },
        {
          x: pos.x - size.w/2,
          y: pos.y + size.h/2
        }
      ];    }

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

        var stdPos = 0;

        var nouvEffet = {
          _id: option._id,
          key: key,
          itemInfo : {shape: null},
          inCanvas: effet.inCanvas || false,
          fonction: 'Effet',
          titre: effet.titre,
          titreOption: option.titre,
          description: effet.description,
          descriptionOption: option.description,
          prix: option.prix,
          points: {},
          composants: []
        };
        nouvEffet.points = getPoints(option.size, {x: stdPos + option.size.w/2, y: stdPos + option.size.h/2});
        for(var i=0; i<option.composants.length; i++){
          var compo = {
            _id: option.composants[i]._id,
            key: key,
            fonction: 'Composant',
            titre: option.composants[i].titre,
            titreParentEffet: effet.titre,
            titreParentOption: option.titre,
            pointsDefault: getPoints(composantItems[option.composants[i].available_compo_id[0]].size, option.composants[i].pos),
            points: getPoints(composantItems[option.composants[i].available_compo_id[0]].size, option.composants[i].pos),
            itemInfo: {
              idItem: composantItems[option.composants[i].available_compo_id[0]]._id,
              items: option.composants[i].available_compo_id,
              shape: composantItems[option.composants[i].available_compo_id[0]].shape,
              titreItem: composantItems[option.composants[i].available_compo_id[0]].titre,
              prixAdd: composantItems[option.composants[i].available_compo_id[0]].prix_additionnel
            }
          };
          nouvEffet.composants.push(compo);
        }
        //nouvEffet.composants.push(polyTest);
        canvasConversion.convertEffetSize(nouvEffet);
        canvasConversion.initializeEffetZoom(nouvEffet);
        dessin.options.push(nouvEffet);
      },
      
      //@todo a garder ?
      zoomInitialize: function(value){
        canvasConversion.setZoom(value);
        for (var i = 0; i < dessin.options.length; i++) {
          canvasConversion.initializeEffetZoom(dessin.options[i]);
        }
      },

      zoomChange: function(value){
        var okZoom = canvasConversion.setZoom(value);
        if (okZoom) {
          if (dessin.boite.fonction === 'MasterBoite') {
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
      //    titreItem: composantItems[idItem].titre,
      //    size: composantItems[idItem].size,
      //    prixAdd: composantItems[idItem].prixAdditionnel
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
            titreItem: composantItems[value].titre,
            idItem: composantItems[value]._id,
            size: composantItems[value].size,
            prixAdd: composantItems[value].prix_additionnel,
            shape: composantItems[value].shape
        };
        compo = _.merge(compo.itemInfo, data);
      }



    };
  });