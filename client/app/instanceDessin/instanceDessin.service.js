'use strict';

angular.module('pedaleswitchApp')
  .factory('instanceDessin', function ($http, canvasGlobalServ, canvasConversion) {

    var selections = canvasGlobalServ.getSelections();
    var composantItems = canvasGlobalServ.getComposantItems();

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
      ];
    }

    /**
     * @todo charger juste les composants des effets ajouter.
     *
     * Créer un tableau associatif composantItems de TOUS les composants existant dans la db.
     * La clé de chq entrée du tableau est l'id de chq composant.
     */
    $http.get('/api/composants').then(response => {
      var initialCompo = response.data;
      for(var j=0; j<initialCompo.length; j++){
        composantItems[initialCompo[j]._id] = initialCompo[j];
      }
    });

    return {

      /**
       * Ajoute un effet dans l'instance dessin.
       * Cette fonction est appelé quand on visite la bibliothèque et que
       * l'on ajoute l'effet au panier en cliquant sur +.
       *
       * @param effet
       * @param option
       */
      setEffet: function(effet, option) {
        var key = selections.length;

        var stdPos = 0;

        var nouvEffet = {
          _id: option._id,
          key: key,
          itemInfo : {shape: null},
          inCanvas: effet.inCanvas || false,
          fonction: 'Effet',
          titre: effet.titre,
          titreOption: option.titre,
          type: effet.type,
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
        canvasConversion.convertEffetSize(nouvEffet);
        canvasConversion.initializeEffetZoom(nouvEffet);
        selections.push(nouvEffet);
      },

      /**
       * Supprime un effet dans l'instance dessin.
       * Cette fonction est appelé depuis la sélection des effets.
       *
       * @param effet
       */
      removeEffet: function (effet) {
        for ( var i = 0; i < selections.length; i++) {
          var selection = selections[i];
          if (selection._id == effet._id && selection.key == effet.key) {
            selections.splice(i, 1);
          }
        }
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