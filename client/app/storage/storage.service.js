'use strict';

angular.module('pedaleswitchApp')
  .factory('storage', function () {

    // Public API here
    return {

      //@todo implementation ici du test du navigateur.
      init: function(){
        if (typeof(Storage) !== 'undefined') {
          // Code for localStorage/sessionStorage.
        } else {
          // Sorry! No Web Storage support..
        }
      },

      //@todo gerer les erreurs.
      // Par exemple or quota.
      put: function(varname, obj){
        localStorage.setItem(varname, JSON.stringify(obj));
      },

      get: function(varname){
        return JSON.parse(localStorage.getItem(varname));
      }
      
    };
  });
