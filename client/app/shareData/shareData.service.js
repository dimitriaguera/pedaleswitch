'use strict';

angular.module('pedaleswitchApp')
  .factory('shareData', function ($http) {
    var savedata = {};
    var bibcompo = {liste:[],data:[]};
    // Public API here
    return {
      $http,
      
      pushdata: function(effet, option) {

        savedata[option._id] = option;
        savedata[option._id]['_ideffet'] = effet._id;
        savedata[option._id]['type'] = effet.type;


        // Fait un tableau de tout les composants de l'option selectionne.
        var arrL = option.composants.length,
            i;
        var newcompo = [];
        for (i = 0; i < arrL; ++i) {
          newcompo = newcompo.concat(option.composants[i]['available_compo_id']);
        }
        
        // Difference entre la biblio et les newcompo.
        var diff = _.difference(newcompo, bibcompo.liste);

        // Charge les compos de la db.
        this.$http.post('/api/composants/all', diff).then(response => {
          response.data.forEach(function(item){
            bibcompo.liste.push(item._id);
          });
        bibcompo.data = bibcompo.data.concat(response.data);
        });
      },
      
      getdata: function(){
        return savedata;
      },

      removedata: function(){

      }
      
    };
  });
