'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasGeneration', function (canvasConversion) {
    // Service logic
    // ...

    class Cercle {
      constructor (entity) {
        this._id = entity._id || null;
        this.key = entity.key || null;
        this.titre = entity.titre || null;
        this.titre_option = entity.titre_option || null;
        this.description = entity.description || null;
        this.description_option = entity.description_option || null;
        this.composants = [];
        this.prix = entity.prix || null;
        this.prix_add = entity.prix_add || null;
        this.size = entity.size || {w: 10, h: 10};
        this.pos = entity.pos;
        this.pos_default = entity.pos_default || null;
        this.pos_parent = entity.pos_parent || {x: 0, y: 0};
        this.isSelected = false;
        this.isOverlapping = false;
      }
      resetCompPos(){
        var compos = this.composants;
        if(compos.length !== 0) {
          for (var i = 0; i < compos.length; i++) {
            compos[i].setX(this.pos.x + compos[i].pos_default.x);
            compos[i].setY(this.pos.y + compos[i].pos_default.y);
          }
        }
      }
      getCenterX(){
        return this.pos.x + (this.size.w / 2);
      }
      getCenterY(){
        return this.pos.y + (this.size.h / 2);
      }
      getRadius(){
        return this.size.w / 2;
      }
      setX(coord){
        this.pos.x = coord;
      }
      setY(coord){
        this.pos.y = coord;
      }
      getX() {
        return this.pos.x;
      }
      getY() {
        return this.pos.y;
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.size.w;
      }
      getBottom() {
        return this.getY() + this.size.h;
      }
      setCenterX(center){
        this.pos.x = center - (this.size.w / 2);
      }
      setCenterY(center){
        this.pos.y = center - (this.size.h / 2);
      }
      getBoundingBoxPoints() {
        return ({
          x: this.pos.x + this.size.w / 2,
          y: this.pos.y + this.size.w / 2,
          r: this.size.w / 2
        });
      }
      setSelected(selected) {
        this.isSelected = selected;
      }
      setOverlapping(overlap) {
        this.isOverlapping = overlap;
      }
      drawCanvas(ctx){
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

    class Rect {
      constructor (entity) {
        this._id = entity._id || null;
        this.key = entity.key || null;
        this.titre = entity.titre || null;
        this.titre_option = entity.titre_option || null;
        this.description = entity.description || null;
        this.description_option = entity.description_option || null;
        this.composants = [];
        this.prix = entity.prix || null;
        this.prix_add = entity.prix_add || null;
        this.size = entity.size || {w: 10, h: 10};
        this.pos = entity.pos;
        this.pos_default = entity.pos_default || null;
        this.pos_parent = entity.pos_parent || {x: 0, y: 0};
        this.isSelected = false;
        this.isOverlapping = false;
      }
      resetCompPos(){
        var compos = this.composants;
        if(compos.length !== 0) {
          for (var i = 0; i < compos.length; i++) {
            compos[i].setX(this.pos.x + compos[i].pos_default.x);
            compos[i].setY(this.pos.y + compos[i].pos_default.y);
          }
        }
      }
      getCenterX(){
        return this.pos.x + (this.size.w / 2);
      }
      getCenterY(){
        return this.pos.y + (this.size.h / 2);
      }
      getRadius(){
        return this.size.w / 2;
      }
      setX(coord){
        this.pos.x = coord;
      }
      setY(coord){
        this.pos.y = coord;
      }
      getX() {
        return this.pos.x;
      }
      getY() {
        return this.pos.y;
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.size.w;
      }
      getBottom() {
        return this.getY() + this.size.h;
      }
      setCenterX(center){
        this.pos.x = center - (this.size.w / 2);
      }
      setCenterY(center){
        this.pos.y = center - (this.size.h / 2);
      }
      getBoundingBoxPoints() {
        // Bords du rectangle.
        // 0 haut gauche, 1 haut droit, 2 bas droit, 3 bas gauche.
        return ([
          {
            x: this.pos.x,
            y: this.pos.y
          },
          {
            x: this.pos.x + this.size.w,
            y: this.pos.y
          },
          {
            x: this.pos.x + this.size.w,
            y: this.pos.y + this.size.h
          },
          {
            x: this.pos.x,
            y: this.pos.y + this.size.h
          }
        ]);
      }
      setSelected(selected) {
        this.isSelected = selected;
      }
      setOverlapping(overlap) {
        this.isOverlapping = overlap;
      }
      drawCanvas(ctx){
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.size.w, this.size.h);

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

    //function Poly (entity) {
    //    this._id = entity._id,
    //    this.titre = entity.titre,
    //    this.titre_option = entity.titre_option,
    //    this.description = entity.description,
    //    this.description_option = entity.description_option,
    //    this.prix = entity.prix,
    //    this.size = entity.size,
    //    this.pos = entity.pos;
    //}

    class Boite {
      constructor (entity) {
        this.size = {
          w: entity.size.w,
          h: entity.size.h
        };
        this.pos = {
          x: entity.pos.x,
          y: entity.pos.y
        };
        this.old_pos = {
          x: entity.pos.x,
          y: entity.pos.y
        };
        this.margin = 5;
        this.isSelected = false;
      }
      
      checkBorderBoite(entity){
        if (entity.pos.x < (this.pos.x + this.margin)){
          this.pos.x = entity.pos.x - this.margin;
          this.size.w =  this.size.w + (this.old_pos.x - entity.pos.x) + this.margin;
          this.old_pos.x = this.pos.x;
        }
        if (entity.pos.y < (this.pos.y + this.margin)){
          this.pos.y = entity.pos.y - this.margin;
          this.size.h =  this.size.h + (this.old_pos.y - entity.pos.y) + this.margin;
          this.old_pos.y = this.pos.y;
        }
        if ((entity.pos.x + entity.size.w) > (this.pos.x + this.size.w - this.margin)){
          this.size.w = (entity.pos.x + entity.size.w) - this.pos.x + this.margin;
        }
        if ((entity.pos.y + entity.size.h) > (this.pos.y + this.size.h - this.margin)){
          this.size.h = (entity.pos.y + entity.size.h) - this.pos.y + this.margin;
        }
      }
      
      getCenterX(){
        return this.pos.x + (this.size.w / 2);
      }
      getCenterY(){
        return this.pos.y + (this.size.h / 2);
      }
      getRadius(){
        return this.size.w / 2;
      }
      setX(coord){
        this.pos.x = coord;
      }
      setY(coord){
        this.pos.y = coord;
      }
      getX() {
        return this.pos.x;
      }
      getY() {
        return this.pos.y;
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.size.w;
      }
      getBottom() {
        return this.getY() + this.size.h;
      }
      setCenterX(center){
        this.pos.x = center - (this.size.w / 2);
      }
      setCenterY(center){
        this.pos.y = center - (this.size.h / 2);
      }
      getBoundingBoxPoints() {
        // Bords du rectangle.
        // 0 haut gauche, 1 haut droit, 2 bas droit, 3 bas gauche.
        return ([
          {
            x: this.pos.x,
            y: this.pos.y
          },
          {
            x: this.pos.x + this.size.w,
            y: this.pos.y
          },
          {
            x: this.pos.x + this.size.w,
            y: this.pos.y + this.size.h
          },
          {
            x: this.pos.x,
            y: this.pos.y + this.size.h
          }
        ]);
      }
      setSelected(selected) {
        this.isSelected = selected;
      }
      drawCanvas(ctx){
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.size.w, this.size.h);
        ctx.stroke();
        ctx.closePath();
      }
    }

    class Arrow {
      constructor(entity, location) {

        this.loc = location || 'argument "location" missing';
        this.entity = entity;
        this.margin = 30;
        this.isSelected = false;
        this.setPos(this.loc);
        this.setTriangleDraw(this.loc);
      }

      setPos(loc){
        switch(loc) {
          case 'right':
            this.pos_start = {
              x: this.entity.pos.x + this.entity.size.w + this.margin,
              y: this.entity.pos.y
            };
            this.pos_end = {
              x: this.entity.pos.x + this.entity.size.w + this.margin,
              y: this.entity.pos.y + this.entity.size.h
            };
            break;
          case 'bottom':
            this.pos_start = {
              x: this.entity.pos.x,
              y: this.entity.pos.y + this.entity.size.h + this.margin
            };
            this.pos_end = {
              x: this.entity.pos.x + this.entity.size.w,
              y: this.entity.pos.y + this.entity.size.h + this.margin
            };
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
              ctx.moveTo(this.pos_start.x, this.pos_start.y);
              ctx.lineTo(this.pos_start.x - 5, this.pos_start.y + 10);
              ctx.lineTo(this.pos_start.x + 5, this.pos_start.y + 10);
              ctx.closePath();
              ctx.fill();
              ctx.moveTo(this.pos_end.x, this.pos_end.y);
              ctx.lineTo(this.pos_end.x - 5, this.pos_end.y - 10);
              ctx.lineTo(this.pos_end.x + 5, this.pos_end.y - 10);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            };

            this.drawText = function(ctx){
              ctx.save();
              ctx.font = "14px sans-serif";
              ctx.fillText(canvasConversion.convertToMm(this.entity.size.h) + ' mm', this.pos_start.x + 10, this.pos_start.y + (this.pos_end.y - this.pos_start.y)/2);
              ctx.restore();
            };

            this.drawCanvas = function(ctx){
              ctx.beginPath();
              ctx.fillRect(this.pos_start.x, this.pos_start.y + 5, 1, this.pos_end.y - this.pos_start.y - 5);
              ctx.closePath();
              this.drawTriangle(ctx);
              this.drawText(ctx);
            };
            break;
          case 'bottom':
            this.drawTriangle = function (ctx){
              ctx.save();
              ctx.fillStyle="gray";
              ctx.beginPath();
              ctx.moveTo(this.pos_start.x, this.pos_start.y);
              ctx.lineTo(this.pos_start.x + 10, this.pos_start.y - 5);
              ctx.lineTo(this.pos_start.x + 10, this.pos_start.y + 5);
              ctx.closePath();
              ctx.fill();
              ctx.moveTo(this.pos_end.x, this.pos_end.y);
              ctx.lineTo(this.pos_end.x - 10, this.pos_end.y - 5);
              ctx.lineTo(this.pos_end.x - 10, this.pos_end.y + 5);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            };

            this.drawText = function(ctx){
              ctx.save();
              ctx.font = "14px sans-serif";
              ctx.fillText(canvasConversion.convertToMm(this.entity.size.w) + ' mm', this.pos_start.x + (this.pos_end.x - this.pos_start.x)/2, this.pos_start.y + 24);
              ctx.restore();
            };

            this.drawCanvas = function(ctx){
              ctx.beginPath();
              ctx.fillRect(this.pos_start.x + 5, this.pos_start.y, this.pos_end.x - this.pos_start.x - 5, 1);
              ctx.closePath();
              this.drawTriangle(ctx);
              this.drawText(ctx);
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

      newBoite: function (entity) {
        return new Boite(entity);
      },

      newArrow: function (entity, location) {
        return new Arrow(entity, location);
      },

      //newPoly: function (entity) {
      //  return new Poly(entity);
      //},
    };

  });
