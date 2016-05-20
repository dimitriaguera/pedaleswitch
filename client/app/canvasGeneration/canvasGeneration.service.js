'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasGeneration', function () {
    // Service logic
    // ...

    function Cercle (entity) {
        this._id = entity._id,
        this.titre = entity.titre,
        this.titre_option = entity.titre_option,
        this.description = entity.description,
        this.description_option = entity.description_option,
        this.prix = entity.prix,
        this.size = entity.size,
        this.pos = entity.pos;
    }

    function Rect (entity) {
        this._id = entity._id,
        this.titre = entity.titre,
        this.titre_option = entity.titre_option,
        this.description = entity.description,
        this.description_option = entity.description_option,
        this.prix = entity.prix,
        this.size = entity.size,
        this.pos = entity.pos,
        this.getCenterX = function(){
          return this.pos.x + (this.size.w / 2);
        },

        this.getCenterY = function(){
          return this.pos.y + (this.size.h / 2);
        },

        this.getRadius = function(){
          return this.size.w / 2;
        },

        this.setCenterX = function(center){
          this.pos.x = center - (this.size.w / 2);
        },

        this.setCenterY = function(center){
          this.pos.y = center - (this.size.h / 2);
        };
    }

    function Poly (entity) {
        this._id = entity._id,
        this.titre = entity.titre,
        this.titre_option = entity.titre_option,
        this.description = entity.description,
        this.description_option = entity.description_option,
        this.prix = entity.prix,
        this.size = entity.size,
        this.pos = entity.pos;
    }

    // Public API here
    return {
      newCercle: function (entity) {
        return new Cercle(entity);
      },

      newRect: function (entity) {
        return new Rect(entity);
      },

      newPoly: function (entity) {
        return new Poly(entity);
      },
    };
  });
