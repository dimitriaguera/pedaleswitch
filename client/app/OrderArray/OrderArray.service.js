'use strict';

angular.module('pedaleswitchApp')
  .factory('OrderArray', function () {
    return {

      /**
       * Cette fonction permet de trier un tableau.
       * Exemple :
       * Composant = {
       *     0: {_id:'1', type:'Led'}
       *     1: {_id:'2', type:'Led'}
       *     2: {_id:'3', type:'Potar'}
       *     3: {_id:'4', type:'Potar'}
       *   }
       *
       * order(Composant, 'type') = {
       *     Led:
       *           0: {_id:'1', type:'Led'}
       *           1: {_id:'2', type:'Led'}
       *     Potar:
       *           0: {_id:'3', type:'Potar'}
       *           1: {_id:'4', type:'Potar'}
       *   }
       * @param array
       * @param key
       * @returns array in order
       */
      order: function(array, key) {
        var arrayTrie = {};
        array.forEach(function (element, index, array) {
          if (typeof this[element[key]] != "undefined") {
            this[element[key]].push(element);
          }
          else {
            this[element[key]] = [];
            this[element[key]][0] = element;
          }
        }, arrayTrie);
        return arrayTrie;
      },

      /**
       * Fonction qui cherche dans un tableau la valeur de la clé index_voulu qui est égale a la valeur val_voulu.
       * Cette fonctionne retourne le path pour acceder à la premiere valeur.
       *
       *
       * @param ArrOrObj tableau ou objet dans lequel on recherche
       * @param index_voulu clé du tableau que l'on veut comparé
       * @param val_voulu valeur que l'on veut
       * @param profondeur profondeur maximale a regarder.
       * @param init permet de reinitisaliser la fonction.
       * @returns Array tableau du chemin d'acces.
       */
      boucle: function(ArrOrObj, index_voulu, val_voulu, profondeur, init) {
        var objout,
          arr,
          arr_l,
          i = 0,
          index = '';

        if (typeof init == 'undefined') init = true;

        // Déclaration et initialisation d'une variable statique.
        if (init){
          this.path = [];
          this.pathok = [];
          this.ok = false;
          this.deep = 0;
        }


        if (typeof ArrOrObj !== 'object' && ArrOrObj !== null) {
          return 0;
        }

        // Coupe la boucle.
        if (this.ok === true || this.deep > profondeur) {
          return this.pathok;
        }

        arr = Object.keys(ArrOrObj);
        arr_l = arr.length;

        for (i = 0; i < arr_l; ++i) {
          if (ArrOrObj[index_voulu] === val_voulu) {
            // console.log('deep :' + this.deep);
            this.path[this.deep] = index_voulu;
            // console.log(this.path.slice(0, this.deep + 1));
            this.ok = true;
            this.pathok = this.path.slice(0, this.deep + 1);
            return this.pathok;
          }
          // Si l'élément est un tableau ou un object boucle dessus.
          if (typeof ArrOrObj[arr[i]] === 'object') {
            this.path[this.deep] = arr[i];
            this.deep++;
            this.boucle(ArrOrObj[arr[i]], index_voulu, val_voulu, profondeur, false);
          }
        }
        this.deep--;
        return (this.pathok.length === 0) ? false : this.pathok;
      },

      /**
       * Supprime un element d'un tableau quand on donne un chemin.
       * @param obj
       * @param path
       */
      supwithpath: function(obj, path){
        var arraytmp = obj,
          index = 0;
        while (arraytmp != null && index < path.length-1) {
          arraytmp = arraytmp[path[index]];
          index++;
        }
        arraytmp.splice(path[path.length-1],1);
      },

      /**
       * Si on donne un objet (ou array) avec un chemin il retourne le sous objet.
       *
       * @param obj
       * @param path
       * @returns {*}
       */
      returnsubarray: function (obj, path) {
        if(typeof path === 'object' && path !== null){
          path = path.join('.');
        }
        if(typeof obj === 'undefined' && obj !== null) {
          return false;
        }
        var _index = path.indexOf('.');
        if(_index > -1) {
          return this.returnsubarray(obj[path.substring(0, _index)], path.substr(_index + 1));
        }
        return obj[path];
      }


    };
  });
