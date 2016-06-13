'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasGeneration', function (canvasConversion) {

    class MasterShape {
      constructor (entity, viewState) {
        this._id = entity._id || null;
        if (Number.isInteger(entity.key)) {
          this.key = entity.key;
        } else {
          this.key = null;
        }
        this.titre = entity.titre || null;
        this.titre_option = entity.titre_option || null;
        this.titre_parent_effet = entity.titre_parent_effet || null;
        this.titre_parent_option = entity.titre_parent_option || null;
        this.description = entity.description || null;
        this.description_option = entity.description_option || null;
        this.composants = [];
        this.item_info = entity.item_info;
        this.prix = entity.prix || null;
        this.size = entity.size;
        this.pos = entity.pos;
        this.pos_default = entity.pos_default || null;
        this.projections = {
          up: null,
          down: null,
          left: null,
          right: null,
          top: null,
          bottom: null
        };
        this.createProjection(viewState);
      }

      createProjection(viewState){
        var proj_size = {
          top: {
            size: {
              w: this.size.w,
              h: this.size.d
            }
          },
          bottom: {
            size: {
              w: this.size.w,
              h: this.size.d
            }
          },
          up: {
            size: {
              w: this.size.w,
              h: this.size.h
            }
          },
          down: {
            size: {
              w: this.size.w,
              h: this.size.h
            }
          },
          left: {
            size: {
              w: this.size.h,
              h: this.size.d
            }
          },
          right: {
            size: {
              w: this.size.h,
              h: this.size.d
            }
          }
        };
        switch (viewState) {
          case 'top':
            this.newProjectionTop(proj_size);
            break;
          case 'bottom':
            this.newProjectionTop(proj_size);
            break;
          case 'up':
            this.newProjectionUp(proj_size);
            break;
          case 'down':
            this.newProjectionUp(proj_size);
            break;
          case 'left':
            this.newProjectionLeft(proj_size);
            break;
          case 'right':
            this.newProjectionLeft(proj_size);
            break;
          default:
            return console.log('ERROR ' + viewState + ' is not a valid state');
        }
      }
      newProjectionUp(proj_size){

        switch (this.item_info.shape) {
          case 'Cercle':
            this.projections.up = new Cercle(this, proj_size.up);
            this.projections.down = new Cercle(this, proj_size.down);
            this.projections.left = new Rect(this, proj_size.left);
            this.projections.right = new Rect(this, proj_size.right);
            this.projections.top = new Rect(this, proj_size.top);
            this.projections.bottom = new Rect(this, proj_size.bottom);
            break;
          default:
            this.projections.up = new Rect(this, proj_size.up);
            this.projections.down = new Rect(this, proj_size.down);
            this.projections.left = new Rect(this, proj_size.left);
            this.projections.right = new Rect(this, proj_size.right);
            this.projections.top = new Rect(this, proj_size.top);
            this.projections.bottom = new Rect(this, proj_size.bottom);
            break;
        }
      }
      newProjectionTop(proj_size){

        switch (this.item_info.shape) {
          case 'Cercle':
            this.projections.up = new Rect(this, proj_size.up);
            this.projections.down = new Rect(this, proj_size.down);
            this.projections.left = new Rect(this, proj_size.left);
            this.projections.right = new Rect(this, proj_size.right);
            this.projections.top = new Cercle(this, proj_size.top);
            this.projections.bottom = new Cercle(this, proj_size.bottom);
            break;
          default:
            this.projections.up = new Rect(this, proj_size.up);
            this.projections.down = new Rect(this, proj_size.down);
            this.projections.left = new Rect(this, proj_size.left);
            this.projections.right = new Rect(this, proj_size.right);
            this.projections.top = new Rect(this, proj_size.top);
            this.projections.bottom = new Rect(this, proj_size.bottom);
            break;
        }
      }
      newProjectionLeft(proj_size){

        switch (this.item_info.shape) {
          case 'Cercle':
            this.projections.up = new Rect(this, proj_size.up);
            this.projections.down = new Rect(this, proj_size.down);
            this.projections.left = new Cercle(this, proj_size.left);
            this.projections.right = new Cercle(this, proj_size.right);
            this.projections.top = new Rect(this, proj_size.top);
            this.projections.bottom = new Rect(this, proj_size.bottom);
            break;
          default:
            this.projections.up = new Rect(this, proj_size.up);
            this.projections.down = new Rect(this, proj_size.down);
            this.projections.left = new Rect(this, proj_size.left);
            this.projections.right = new Rect(this, proj_size.right);
            this.projections.top = new Rect(this, proj_size.top);
            this.projections.bottom = new Rect(this, proj_size.bottom);
            break;
        }
      }
    }

    class Shape {
      constructor (entity, proj_size) {
        this._id = entity._id || null;

        if (Number.isInteger(entity.key)) {
          this.key = entity.key;
        } else {
          this.key = null;
        }
        this.titre = entity.titre || null;
        this.titre_option = entity.titre_option || null;
        this.titre_parent_effet = entity.titre_parent_effet || null;
        this.titre_parent_option = entity.titre_parent_option || null;
        this.description = entity.description || null;
        this.description_option = entity.description_option || null;
        this.composants = [];
        this.item_info = entity.item_info || null;
        this.prix = entity.prix || null;
        this.size = proj_size.size;
        this.pos = entity.pos;
        this.pos_default = entity.pos_default || null;
        this.isSelected = false;
        this.isOverlapping = false;
      }
      resetCompPos(){
        var compos = this.composants;
        if(compos.length !== 0) {
          for (var i = 0; i < compos.length; i++) {
            compos[i].setX(this.pos.x.v + compos[i].pos_default.x.v);
            compos[i].setY(this.pos.y.v + compos[i].pos_default.y.v);
          }
        }
      }
      getCenterX(){
        return this.pos.x.v + (this.size.w.v / 2);
      }
      getCenterY(){
        return this.pos.y.v + (this.size.h.v / 2);
      }
      getRadius(){
        return this.size.w.v / 2;
      }
      setX(coord){
        this.pos.x.v = coord;
      }
      setY(coord){
        this.pos.y.v = coord;
      }
      getX() {
        return this.pos.x.v;
      }
      getY() {
        return this.pos.y.v;
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.size.w.v;
      }
      getBottom() {
        return this.getY() + this.size.h.v;
      }
      setCenterX(center){
        this.pos.x.v = center - (this.size.w.v / 2);
      }
      setCenterY(center){
        this.pos.y.v = center - (this.size.h.v / 2);
      }
      setSelected(selected) {
        this.isSelected = selected;
      }
      setOverlapping(overlap) {
        this.isOverlapping = overlap;
      }
      getMax(){
        return {
          t: this.getTop(),
          r: this.getRight(),
          b: this.getBottom(),
          l: this.getLeft()
        }
      }
    }


    class Cercle extends Shape {
      drawCanvas(ctx) {
        ctx.beginPath();
        ctx.arc(this.getCenterX(), this.getCenterY(), this.getRadius(), 0, 2*Math.PI);
        // Draw center.
        ctx.fillRect(this.getCenterX(),this.getCenterY(),1,1);
        if (this.isOverlapping) {
          ctx.fillStyle = "rgba(255, 00, 00, 0.2)";
          ctx.fill();
        }
        ctx.stroke();
        ctx.closePath();
      }
    }

    class Rect extends Shape {
        drawCanvas(ctx){
        ctx.beginPath();
        ctx.rect(this.pos.x.v, this.pos.y.v, this.size.w.v, this.size.h.v);

        // Draw center.
        ctx.fillRect(this.getCenterX(),this.getCenterY(),1,1);

        if (this.isOverlapping) {
          ctx.fillStyle = "rgba(255, 00, 00, 0.2)";
          ctx.fill();
        }
        ctx.stroke();
        ctx.closePath();
      }
    }

    class MasterBoite {
      constructor () {
        this.margin = {v: 5};
        this.initialHeight = {v: 40};
        this.size = {
          w: {v: null},
          h: {v: null},
          d: this.initialHeight
        };
        this.pos = {
          x: {v: 40},
          y: {v: 40},
          z: {v: 40}
        };
        this.projections = {
          up: null,
          down: null,
          left: null,
          right: null,
          top: null,
          bottom: null
        };
        this.createProjection();

      }
      convertMargin(){
        this.margin.v = canvasConversion.convertToPixel(this.margin.v);
      }
      convertInitialHeight(){
        this.initialHeight.v = canvasConversion.convertToPixel(this.initialHeight.v);
      }
      createProjection(){
        var proj_size = {
          top: {
            size: {
              w: this.size.w,
              h: this.size.d
            }
          },
          bottom: {
            size: {
              w: this.size.w,
              h: this.size.d
            }
          },
          up: {
            size: {
              w: this.size.w,
              h: this.size.h
            }
          },
          down: {
            size: {
              w: this.size.w,
              h: this.size.h
            }
          },
          left: {
            size: {
              w: this.size.h,
              h: this.size.d
            }
          },
          right: {
            size: {
              w: this.size.h,
              h: this.size.d
            }
          }
        };
        this.projections.up = new Boite(this, proj_size.up);
        this.projections.down = new Boite(this, proj_size.down);
        this.projections.left = new Boite(this, proj_size.left);
        this.projections.right = new Boite(this, proj_size.right);
        this.projections.top = new Boite(this, proj_size.top);
        this.projections.bottom = new Boite(this, proj_size.bottom);
      }
      //initProjectionPos(state){
      //  this.projections[state].pos = {
      //    x: {v: 40},
      //    y: {v: 40}
      //  };
      //}
    }

    class Boite {
      constructor (masterBoite, proj_size) {
        this.margin = masterBoite.margin;
        this.size = proj_size.size;// En mm, converti en px juste après création de la boite dans canvasControl.
        this.pos = masterBoite.pos;
        this.isSelected = false;
        this.isOverlapping = false;
        this.titre = 'Boite';
        this.effets = [];
      }
      // Tout doit etre en Pixel.
      //initBoiteWithBoite(boite){
      //  this.margin = boite.margin;
      //  this.size = {
      //    w: {v: boite.size.w.v},
      //    h: {v: boite.size.h.v}
      //  };
      //  this.pos = {
      //    x: {v: boite.pos.x.v},
      //    y: {v: boite.pos.y.v}
      //  };
      //}
      initBoiteWithEffect(entity){
        this.size.w.v = entity.size.w.v + 2 * this.margin.v;
        this.size.h.v = entity.size.h.v + 2 * this.margin.v;
        this.pos.x.v = entity.pos.x.v - this.margin.v;
        this.pos.y.v = entity.pos.y.v - this.margin.v;
      }
      // Redimensionne la boite si le nouvel effet est en dehors.
      checkBorderBoite(entity){
        if (entity.pos.x.v < (this.pos.x.v + this.margin.v)){
          var old_pos_x = this.pos.x.v;
          this.pos.x.v = entity.pos.x.v - this.margin.v;
          this.size.w.v =  this.size.w.v + (old_pos_x - entity.pos.x.v) + this.margin.v;
        }
        if (entity.pos.y.v < (this.pos.y.v + this.margin.v)){
          var old_pos_y = this.pos.y.v;
          this.pos.y.v = entity.pos.y.v - this.margin.v;
          this.size.h.v =  this.size.h.v + (old_pos_y - entity.pos.y.v) + this.margin.v;
        }
        if ((entity.pos.x.v + entity.size.w.v) > (this.pos.x.v + this.size.w.v - this.margin.v)){
          this.size.w.v = (entity.pos.x.v + entity.size.w.v) - this.pos.x.v + this.margin.v;
        }
        if ((entity.pos.y.v + entity.size.h.v) > (this.pos.y.v + this.size.h.v - this.margin.v)){
          this.size.h.v = (entity.pos.y.v + entity.size.h.v) - this.pos.y.v + this.margin.v;
        }
      }

      moveEffetCompo(delta){
        var effets = this.effets, compos, i, j;
        if(effets.length !== 0) {
          for (i = 0; i < effets.length; i++) {
            effets[i].setX(delta.deltaX + effets[i].pos.x.v);
            effets[i].setY(delta.deltaY + effets[i].pos.y.v);
            
            compos = effets[i].composants;
            if(compos.length !== 0) {
              for (j = 0; j < compos.length; j++) {
                compos[j].setX(delta.deltaX + compos[j].pos.x.v);
                compos[j].setY(delta.deltaY + compos[j].pos.y.v);
              }
            }
          }
        }
      }
      
      getCenterX(){
        return this.pos.x.v + (this.size.w.v / 2);
      }
      getCenterY(){
        return this.pos.y.v + (this.size.h.v / 2);
      }
      getRadius(){
        return this.size.w.v / 2;
      }
      setX(coord){
        this.pos.x.v = coord;
      }
      setY(coord){
        this.pos.y.v = coord;
      }
      getX() {
        return this.pos.x.v;
      }
      getY() {
        return this.pos.y.v;
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.size.w.v;
      }
      getBottom() {
        return this.getY() + this.size.h.v;
      }
      setCenterX(center){
        this.setX(center - (this.size.w.v / 2));
      }
      setCenterY(center){
        this.setY(center - (this.size.h.v / 2));
      }
      getMax(){
        return {
          t: this.getTop(),
          r: this.getRight(),
          b: this.getBottom(),
          l: this.getLeft()
        }
      }
      setSelected(selected) {
        this.isSelected = selected;
      }
      setOverlapping(overlap) {
        this.isOverlapping = overlap;
      }
      drawCanvas(ctx){
        ctx.beginPath();
        ctx.rect(this.pos.x.v, this.pos.y.v, this.size.w.v, this.size.h.v);
        ctx.stroke();
        ctx.closePath();
      }
    }

    /**
     * Constructeur de classe Arrow.
     *
     * @param entity: objet Thing auquel lier l'Arrow.
     * @param location : string. Valeurs acceptées :
     *   'rigth' : fleche a droite de l'objet Thing.
     *   'bottom' : fleche en bas de l'objet Thing.
     */

    class Arrow {
      constructor(entity, location) {

        this.loc = location || 'argument "location" missing';
        this.entity = entity;
        this.margin = 30;
        this.isSelected = false;
        this.setMethods(this.loc);
        this.setPos(this.loc);
        this.setTriangleDraw(this.loc);
      }

      setMethods(loc){
        switch(loc) {
          case 'right':
            this.setValue = function(value){
              this.entity.size.h.v = canvasConversion.convertToPixel(value);
            };
            break;
          case 'bottom':
            this.setValue = function(value){
              this.entity.size.w.v = canvasConversion.convertToPixel(value);
            };
            break;
          default:
            console.log(loc + '--> terme non reconnu par le constructeur Arrow');
        }
      }

      setPos(loc){
        switch(loc) {
          case 'right':
            this.pos_start = {
              x: {v: this.entity.pos.x.v + this.entity.size.w.v + this.margin},
              y: {v: this.entity.pos.y.v}
            };
            this.pos_end = {
              x: {v: this.entity.pos.x.v + this.entity.size.w.v + this.margin},
              y: {v: this.entity.pos.y.v + this.entity.size.h.v}
            };
            this.pos_box = {
              x: {v: this.pos_start.x.v + 10},
              y: {v: this.pos_start.y.v + (this.pos_end.y.v - this.pos_start.y.v)/2}
            };
            this.value = canvasConversion.convertToMm(this.entity.size.h.v);
            break;
          case 'bottom':
            this.pos_start = {
              x: {v: this.entity.pos.x.v},
              y: {v: this.entity.pos.y.v + this.entity.size.h.v + this.margin}
            };
            this.pos_end = {
              x: {v: this.entity.pos.x.v + this.entity.size.w.v},
              y: {v: this.entity.pos.y.v + this.entity.size.h.v + this.margin}
            };
            this.pos_box = {
              x: {v: this.pos_start.x.v + (this.pos_end.x.v - this.pos_start.x.v)/2},
              y: {v: this.pos_start.y.v + 20}
            };
            this.value = canvasConversion.convertToMm(this.entity.size.w.v);
            break;
          default:
          console.log(loc + '--> terme non reconnu par le constructeur Arrow');
        }
      }

      setTriangleDraw(loc){
        switch(loc) {
          case 'right':
            this.drawTriangle = function(ctx){
              ctx.save();
              ctx.fillStyle="gray";
              ctx.beginPath();
              ctx.moveTo(this.pos_start.x.v, this.pos_start.y.v);
              ctx.lineTo(this.pos_start.x.v - 5, this.pos_start.y.v + 10);
              ctx.lineTo(this.pos_start.x.v + 5, this.pos_start.y.v + 10);
              ctx.closePath();
              ctx.fill();
              ctx.moveTo(this.pos_end.x.v, this.pos_end.y.v);
              ctx.lineTo(this.pos_end.x.v - 5, this.pos_end.y.v - 10);
              ctx.lineTo(this.pos_end.x.v + 5, this.pos_end.y.v - 10);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            };

            this.drawText = function(ctx){
              ctx.save();
              ctx.font = "14px sans-serif";
              ctx.fillText(this.value + ' mm', this.pos_box.x.v, this.pos_box.y.v);
              ctx.restore();
            };

            this.drawCanvas = function(ctx){
              ctx.beginPath();
              ctx.fillRect(this.pos_start.x.v, this.pos_start.y.v + 5, 1, this.pos_end.y.v - this.pos_start.y.v - 5);
              ctx.closePath();
              this.drawTriangle(ctx);
              //this.drawText(ctx);
            };
            break;
          case 'bottom':
            this.drawTriangle = function (ctx){
              ctx.save();
              ctx.fillStyle="gray";
              ctx.beginPath();
              ctx.moveTo(this.pos_start.x.v, this.pos_start.y.v);
              ctx.lineTo(this.pos_start.x.v + 10, this.pos_start.y.v - 5);
              ctx.lineTo(this.pos_start.x.v + 10, this.pos_start.y.v + 5);
              ctx.closePath();
              ctx.fill();
              ctx.moveTo(this.pos_end.x.v, this.pos_end.y.v);
              ctx.lineTo(this.pos_end.x.v - 10, this.pos_end.y.v - 5);
              ctx.lineTo(this.pos_end.x.v - 10, this.pos_end.y.v + 5);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            };

            this.drawText = function(ctx){
              ctx.save();
              ctx.font = "14px sans-serif";
              ctx.fillText(this.value + ' mm', this.pos_box.x.v, this.pos_box.y.v);
              ctx.restore();
            };

            this.drawCanvas = function(ctx){
              ctx.beginPath();
              ctx.fillRect(this.pos_start.x.v + 5, this.pos_start.y.v, this.pos_end.x.v - this.pos_start.x.v - 5, 1);
              ctx.closePath();
              this.drawTriangle(ctx);
              //this.drawText(ctx);
            };
            break;
          default:
            console.log(loc + '--> terme non reconnu par le constructeur Arrow');
        }
      }
    }

    // Public API here
    return {
      newCercle: function (entity) {
        return new Cercle(entity);
      },

      newRect: function (entity) {
        return new Rect(entity);
      },

      newBoite: function () {
        return new Boite();
      },

      newArrow: function (entity, location) {
        return new Arrow(entity, location);
      },

      newMasterShape: function (entity, viewState) {
        return new MasterShape(entity, viewState);
      },

      newMasterBoite: function () {
        return new MasterBoite();
      }

      //newPoly: function (entity) {
      //  return new Poly(entity);
      //},
    };

  });
