'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasGeneration', function (canvasConversion) {

    class Point {
      constructor(point){
        this.x = point.x;
        this.y = point.y;
      }
      translate(vector){
        this.x += vector.x;
        this.y += vector.y;
      }
      /**
       * Rotation d'un point par rapport à C
       */
      rotate(angle, C) {
        var alpha_rad = angle * (2*Math.PI)/360.0;
        var cos = Math.cos(alpha_rad);
        var sin = Math.sin(alpha_rad);
        var pos_c = {};

        // Calcul des coordonné du point dans le repère du baricentre C.
        pos_c.x = this.getX() - C.x;
        pos_c.y = this.getY() - C.y;

        // Calcul des coordonnées du point après rotation dans le repère d'origine.
        this.setX(pos_c.x * cos + pos_c.y * sin + C.x);
        this.setY(- pos_c.x * sin + pos_c.y * cos + C.y);
      }
      getX(){
        return this.x;
      }
      getY(){
        return this.y;
      }
      setX(value){
        this.x = value;
      }
      setY(value){
        this.y = value;
      }
    }

    class Shape {
      constructor (entity) {
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
        
        this.isSelected = false;
        this.isOverlapping = false;

        this.points = entity.points;
        this.points_default = entity.points_default || null;
        this.initPoints(entity.points, this.points);
        this.initPoints(entity.points_default, this.points_default);
      }
      initPoints(points, tab){
        if (points) {
          var i;
          var l = points.length;
          var table = [];
          for (i = 0; i < l; i++) {
            table.push(new Point(points[i]));
          }
          tab.splice(0, tab.length);
          for (i = 0; i < l; i++) {
            tab.push(table[i]);
          }
        }
      }
      resetCompPos(){
        var compos = this.composants;
        if (compos.length !== 0) {

          // Pour chaque composants.
          for (var i = 0; i < compos.length ; i++) {
            // Pour chaque points j du composants i.
            for (var j = 0 ; j < compos[i].points.length ; j++){
              compos[i].points[j].x = this.points[0].x + compos[i].points_default[j].x ;
              compos[i].points[j].y = this.points[0].y + compos[i].points_default[j].y ;
            }
          }
        }
      }

      /**
       * Aire d'un poly tester et c OK
       * @returns {number}
       */
      getArea() {
        var area = 0;
        for (var i = 0, l = this.points.length; i < l - 1 ; i++){
          area += this.points[i].x * this.points[i+1].y - this.points[i+1].x * this.points[i].y;
        }
        area += this.points[l-1].x * this.points[0].y - this.points[0].x * this.points[l-1].y;
        area /= 2;
        return area;
      }
      
      /**
       * Centre de masse d'un poly OK
       * @returns {{x: number, y: number}}
       */
      getCenter(){
        var area = this.getArea();

        var xg = 0, yg = 0, coef;

        for (var i = 0, l = this.points.length; i < l - 1 ; i++){
          coef = this.points[i].x * this.points[i+1].y - this.points[i+1].x * this.points[i].y;
          xg += (this.points[i].x + this.points[i+1].x) * coef;
          yg += (this.points[i].y + this.points[i+1].y) * coef;
        }
        coef = this.points[l-1].x * this.points[0].y - this.points[0].x * this.points[l-1].y;
        xg += (this.points[l-1].x + this.points[0].x) * coef;
        yg += (this.points[l-1].y + this.points[0].y) * coef;

        xg /= 6 * area;
        yg /= 6 * area;

        return {
          x: xg,
          y: yg
        }
      }
      getCenterX(){
        return this.getCenter().x;
      }
      getCenterY(){
        return this.getCenter().y;
      }
      /**
       * Deplace l'objet a la position donnée par le nouveau barycentre OK.
       * @param pos
       */
      moveTo(pos){
        var bary = this.getCenter();
        var vect = {x: pos.x - bary.x, y: pos.y - bary.y};
        this.move(vect);
      }

      /**
       * Deplace l'obj d'un delta
       * @param vec
       */
      move(vect){
        for (var i = 0, l = this.points.length; i < l; i++){
          this.points[i].translate(vect);
        }
      }
      
      findExtreme(){
        var posExtreme = {t:Infinity,r:-Infinity,b:-Infinity,l:Infinity};
        
        var saveExtreme = function(posExtreme, pos){
          posExtreme.t = Math.min(posExtreme.t, pos.y);
          posExtreme.r = Math.max(posExtreme.r, pos.x);
          posExtreme.b = Math.max(posExtreme.b, pos.y);
          posExtreme.l = Math.min(posExtreme.l, pos.x);
        };

        for (var i = 0, l = this.points.length; i < l; i++){
         saveExtreme(posExtreme, this.points[i]);
        }

        posExtreme.size = {w: posExtreme.r - posExtreme.l, h: posExtreme.b - posExtreme.t};
        return(posExtreme);
      }

      setSelected(selected) {
        this.isSelected = selected;
      }
      setOverlapping(overlap) {
        this.isOverlapping = overlap;
      }
      /**
       * Rotate un element.
       * @param angle en degre
       * @param C : position du centre de rotation.
       * @param debrayable : boolean on est en debrayable ou pas.
       */
      rotate(angle, C, debrayable){
        var i, l, j, l2;
        var point;
        var old_p0 = new Point(this.points[0]);

        debrayable = debrayable || false;
        // Barycentre.
        C = C || { x: this.getCenterX(), y: this.getCenterY()};
        
        // Tourne l'effet
        for (i = 0, l = this.points.length; i < l; i++){
          this.points[i].rotate(angle, C);          
        }

        // Tourne les composants
        if (this.composants.length > 0) {
          // Si pas debrayable fait tourner les composants.
          if (!debrayable) {
            for (i = 0, l = this.composants.length; i < l; i++) {
              for (j = 0, l2 = this.composants[i].points.length; j < l2; j++) {
                this.composants[i].points[j].rotate(angle, C);
                // Re-initialise la position par defaut.
                this.composants[i].points_default[j].setX(this.composants[i].points[j].getX() - this.points[0].getX());
                this.composants[i].points_default[j].setY(this.composants[i].points[j].getY() - this.points[0].getY());
              }
            }
          }
          // Si debrayable doit appliquer un rotation au composant qui serait virtuellement dans cette
          // position si cela n'avait pas été débrayable afin de remettre le composant à la bonne place
          // si l'utilisateur switch de debrayable à non.
          else {
            for (i = 0, l = this.composants.length; i < l; i++) {
              for (j = 0, l2 = this.composants[i].points.length; j < l2; j++) {

                point = new Point(this.composants[i].points_default[j]);

                // Coordonnée du pt dans le ref du barycentre OK.
                point.setX(point.getX() + old_p0.getX() - C.x);
                point.setY(point.getY() + old_p0.getY() - C.y);

                // Rotation du pt par rapport au bary dans le repère du bary.
                point.rotate(angle, {x:0,y:0});

                // Coordonné du pt par rapport à p0 de l'effet deja rotate.
                point.setX(C.x + point.getX() - this.points[0].getX());
                point.setY(C.y + point.getY() - this.points[0].getY());

                // Affectation.
                this.composants[i].points_default[j].setX(point.getX());
                this.composants[i].points_default[j].setY(point.getY());
              }
            }
          }
        }
      }

    }


    class Cercle extends Shape {
      constructor(entity){
        super(entity);
        this.shapeObject = 'Cercle';
      }
      getRadius(){
        var x = this.findExtreme();
        return (x.b - x.t) /2;
      }
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
      constructor(entity){
        super(entity);
        this.shapeObject = 'Rect';
      }
      drawCanvas(ctx){
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 0, length = this.points.length; i < length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Draw center.
        ctx.fillRect(this.getCenterX(),this.getCenterY(),1,1);

        if (this.isOverlapping) {
          ctx.fillStyle = "rgba(255, 00, 00, 0.2)";
          ctx.fill();
        }
      }
    }

    class Poly extends Shape {
      constructor(entity) {
        super(entity);
        this.shapeObject = 'Poly';
      }
    }

    /**
     * Constructeur de la classe MasterBoite.
     */
    class MasterBoite {
      constructor(entity) {
        this.margin = 5;
        this.initialHeight = 100;
        this.convertMargin();
        this.convertInitialHeight();
        this.size = {
          w: null,
          h: null,
          d: null,
          d1: this.initialHeight,
          d2: this.initialHeight
        };
        this.projections = {
          up: null,
          down: null,
          left: null,
          right: null,
          top: null,
          bottom: null
        };
        this.initBoiteWithEffect(entity);
      }

      setSide(side, value){
        this.size[side] = value;
      }

      getSide(side){
        return this.size[side];
      }

      initBoiteWithEffect(entity){
        var extremePos = entity.findExtreme();
        var d = extremePos.size.h + 2 * this.margin;
        var w = extremePos.size.w + 2 * this.margin;
        var d3 = this.getSide('d2') - this.getSide('d1');
        this.setSide('w', w);
        this.setSide('d', d);
        this.setSide('h', Math.sqrt(d*d - d3*d3));
      }

      convertMargin() {
        this.margin = canvasConversion.convertToPixel(this.margin);
      }

      convertInitialHeight() {
        this.initialHeight = canvasConversion.convertToPixel(this.initialHeight);
      }

      createProjectionsCoords(state) {
        var proj_points = {
          top: {
            points:[
              {
                x: 0,
                y: 0
              },
              {
                x: this.getSide('w'),
                y: 0
              },
              {
                x: this.getSide('w'),
                y: this.getSide('d2')
              },
              {
                x: 0,
                y: this.getSide('d2')
              }
            ]
          },
          bottom: {
            points: [
              {
                x: 0,
                y: 0
              },
              {
                x: this.getSide('w'),
                y: 0
              },
              {
                x: this.getSide('w'),
                y: this.getSide('d1')
              },
              {
                x: 0,
                y: this.getSide('d1')
              }
            ]
          },
          up: {
            points: [
              {
                x: 0,
                y: 0
              },
              {
                x: this.getSide('w'),
                y: 0
              },
              {
                x: this.getSide('w'),
                y: this.getSide('d')
              },
              {
                x: 0,
                y: this.getSide('d')
              }
            ]
          },
          down: {
            points: [
              {
                x: 0,
                y: 0
              },
              {
                x: this.getSide('w'),
                y: 0
              },
              {
                x: this.getSide('w'),
                y: this.getSide('h')
              },
              {
                x: 0,
                y: this.getSide('h')
              }
            ]
          },
          left: {
            points: [
              {
                x: 0,
                y: 0
              },
              {
                x: this.getSide('h'),
                y: this.getSide('d2') - this.getSide('d1')
              },
              {
                x: this.getSide('h'),
                y: this.getSide('d2')
              },
              {
                x: 0,
                y: this.getSide('d2')
              }
            ]
          },
          right: {
            points: [
              {
                x: 0,
                y: 0
              },
              {
                x: this.getSide('h'),
                y: this.getSide('d1') - this.getSide('d2')
              },
              {
                x: this.getSide('h'),
                y: this.getSide('d1')
              },
              {
                x: 0,
                y: this.getSide('d1')
              }
            ]
          }
        };
        switch (state) {
          case 'top':
            return proj_points.top;
            break;
          case 'bottom':
            return proj_points.bottom;
            break;
          case 'up':
            return proj_points.up;
            break;
          case 'down':
            return proj_points.down;
            break;
          case 'left':
            return proj_points.left;
            break;
          case 'right':
            return proj_points.right;
            break;
          case 'all':
            return proj_points;
            break;
          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      }
      createProjection() {
        var proj_points = this.createProjectionsCoords('all');
        this.projections.up = new Boite(this, proj_points.up);
        this.projections.down = new Boite(this, proj_points.down);
        this.projections.left = new Boite(this, proj_points.left);
        this.projections.right = new Boite(this, proj_points.right);
        this.projections.top = new Boite(this, proj_points.top);
        this.projections.bottom = new Boite(this, proj_points.bottom);
      }
      updateProjection(state){
        var vect;
        var coords = this.createProjectionsCoords(state).points;
        var points = this.projections[state].points;

        // On récupère les anciennes coordonées du point p0.
        vect = {
          x: points[0].x,
          y: points[0].y
        };

        // Si la coordonnées de positionne est de 0, on deplace la figure.
        if (vect.x === 0 && vect.y === 0){
          vect.x = 200;
          vect.y = 200;
        }

        for (var i=0, l = points.length ; i < l ; i++) {
          // On transmet les nouvelles coordonnées absolues.
          points[i].setX(coords[i].x);
          points[i].setY(coords[i].y);
          // On bouge la forme selon les anciennes coordonnées.
          points[i].translate(vect);
        }
      }
      updateMaster(state){
        var proj, h, d, d1, d2, d3;
        switch (state) {
          case 'top':
            proj = this.projections[state];
            this.setSide('w', proj.points[1].x - proj.points[0].x);
            this.setSide('d2', proj.points[3].y - proj.points[0].y);
            break;
          case 'bottom':
            proj = this.projections[state];
            this.setSide('w', proj.points[1].x - proj.points[0].x);
            this.setSide('d1', proj.points[3].y - proj.points[0].y);
            break;
          case 'up':
            proj = this.projections[state];
            d = proj.points[3].y - proj.points[0].y;
            d1 = this.getSide('d1');
            d2 = this.getSide('d2');
            d3 = d2 - d1;
            h = Math.sqrt(d * d - d3 * d3);
            this.setSide('w', proj.points[1].x - proj.points[0].x);
            this.setSide('d', d);
            this.setSide('h', h);
            break;
          case 'down':
            proj = this.projections[state];
            h = proj.points[3].y - proj.points[0].y;
            d1 = this.getSide('d1');
            d2 = this.getSide('d2');
            d3 = d2 - d1;
            d = Math.sqrt(h * h + d3 * d3);
            this.setSide('w', proj.points[1].x - proj.points[0].x);
            this.setSide('d', d);
            this.setSide('h', h);
            break;
          case 'left':
            proj = this.projections[state];
            h = proj.points[2].x - proj.points[3].x;
            d2 = proj.points[3].y - proj.points[0].y;
            d1 = proj.points[2].y - proj.points[1].y;
            d3 = d2 - d1;
            this.setSide('h', h);
            this.setSide('d', Math.sqrt(h*h + d3*d3));
            this.setSide('d1', d1);
            this.setSide('d2', d2);
            break;
          case 'right':
            proj = this.projections[state];
            h = proj.points[2].x - proj.points[3].x;
            d1 = proj.points[3].y - proj.points[0].y;
            d2 = proj.points[2].y - proj.points[1].y;
            d3 = d2 - d1;
            this.setSide('h', h);
            this.setSide('d', Math.sqrt(h*h + d3*d3));
            this.setSide('d1', d1);
            this.setSide('d2', d2);
            break;
          case 'all':
            return false;
            break;
          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      }
    }

    /**
     * Constructeur de la classe Boite.
     */
    class Boite {
      constructor (masterBoite, proj_points) {
        
        this.margin = masterBoite.margin;
        this.isSelected = false;
        this.isOverlapping = false;
        this.titre = 'Boite';
        this.effets = [];
        this.composants = [];
        this.points = [];
        this.textDecoration = [];
        this.shapeDecoration = [];
        this.imgDecoration = [];
        this.initPoints(proj_points.points, this.points);
      }

      initPoints(points, tab){
        if (points) {
          var i;
          var l = points.length;
          var table = [];
          for (i = 0; i < l; i++) {
            table.push(new Point(points[i]));
          }
          tab.splice(0, tab.length);
          for (i = 0; i < l; i++) {
            tab.push(table[i]);
          }
        }
      }

      initMoveBox(entity){
        var extremePos = entity.findExtreme();
        var vect = {
          x: extremePos.l - this.margin,
          y: extremePos.t - this.margin
        };
        this.move(vect);
      }

      move(vect){
        for (var i = 0, l = this.points.length; i < l; i++){
          this.points[i].translate(vect);
        }
      }

      moveEffetCompo(delta){
        var effets, text, shape, img, compos, i, j;
        effets = this.effets;
        text = this.textDecoration;
        shape = this.shapeDecoration;
        img = this.imgDecoration;

        if(effets.length !== 0) {
          for (i = 0; i < effets.length; i++) {
            effets[i].move(delta);
            compos = effets[i].composants;
            if (compos.length !== 0) {
              for (j = 0; j < compos.length; j++) {
                compos[j].move(delta);
              }
            }
          }
        }
        if(text.length !== 0) {
          for (i = 0; i < text.length; i++) {
            text[i].move(delta);
          }
        }
      }
      
      findExtreme(){
        var posExtreme = {t:Infinity,r:-Infinity,b:-Infinity,l:Infinity};

        var saveExtreme = function(posExtreme, pos){
          posExtreme.t = Math.min(posExtreme.t, pos.y);
          posExtreme.r = Math.max(posExtreme.r, pos.x);
          posExtreme.b = Math.max(posExtreme.b, pos.y);
          posExtreme.l = Math.min(posExtreme.l, pos.x);
        };

        for (var i = 0, l = this.points.length; i < l; i++){
          saveExtreme(posExtreme, this.points[i]);
        }

        posExtreme.size = {w: posExtreme.r - posExtreme.l, h: posExtreme.b - posExtreme.t};
        return(posExtreme);
      }


      /**
       * Redimensionne la boite si le nouvel effet est en dehors.
       */
      checkBorderBoite(entity){
        var posExt = entity.findExtreme();
        var posExtBoite = this.findExtreme();

        // L'obj est à gauche de la boite
        if (posExt.l < (posExtBoite.l + this.margin)){
          this.points[0].setX(posExt.l - this.margin);
          this.points[3].setX(posExt.l - this.margin);
        }
        // L'obj est à haut de la boite
        if (posExt.t < (posExtBoite.t + this.margin)){
          this.points[0].setY(posExt.t - this.margin);
          this.points[1].setY(posExt.t - this.margin);
        }
        // L'obj est à droite de la boite
        if (posExt.r > (posExtBoite.r - this.margin)){
          this.points[1].setX(posExt.r + this.margin);
          this.points[2].setX(posExt.r + this.margin);
        }
        // L'obj est en bas de la boite
        if (posExt.b > (posExtBoite.b - this.margin)){
          this.points[2].setY(posExt.b + this.margin);
          this.points[3].setY(posExt.b + this.margin);
        }
      }

      /**
       * Aire d'un poly tester et c OK
       * @returns {number}
       */
      getArea() {
        var area = 0;
        for (var i = 0, l = this.points.length; i < l - 1 ; i++){
          area += this.points[i].x * this.points[i+1].y - this.points[i+1].x * this.points[i].y;
        }
        area += this.points[l-1].x * this.points[0].y - this.points[0].x * this.points[l-1].y;
        area /= 2;
        return area;
      }

      /**
       * Centre de masse d'un poly OK
       * @returns {{x: number, y: number}}
       */
      getCenter(){
        var area = this.getArea();

        var xg = 0, yg = 0, coef;

        for (var i = 0, l = this.points.length; i < l - 1 ; i++){
          coef = this.points[i].x * this.points[i+1].y - this.points[i+1].x * this.points[i].y;
          xg += (this.points[i].x + this.points[i+1].x) * coef;
          yg += (this.points[i].y + this.points[i+1].y) * coef;
        }
        coef = this.points[l-1].x * this.points[0].y - this.points[0].x * this.points[l-1].y;
        xg += (this.points[l-1].x + this.points[0].x) * coef;
        yg += (this.points[l-1].y + this.points[0].y) * coef;

        xg /= 6 * area;
        yg /= 6 * area;

        return {
          x: xg,
          y: yg
        }
      }
      getCenterX(){
        return this.getCenter().x;
      }
      getCenterY(){
        return this.getCenter().y;
      }

      setSelected(selected) {
        this.isSelected = selected;
      }
      setOverlapping(overlap) {
        this.isOverlapping = overlap;
      }
      drawCanvas(ctx){
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 0, length = this.points.length; i < length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    //class Texte {
    //  constructor(obj){
    //    this.font = {};
    //    // normal, italic, oblique
    //    this.font.style = obj.font.style || 'normal';
    //    //normal, small-caps
    //    this.font.variant = obj.font.variant || 'normal';
    //    // normal, bold, bolder, lighter, 100, 200 ... 900.
    //    this.font.weight = obj.font.weight || 'normal';
    //    this.font.size = obj.font.size || '14';
    //    this.font.family = obj.font.family || 'sans-serif';
    //    //this.textAlign = obj.textAlign || 'left';
    //    this.color = obj.color || 'black';
    //    this.input = obj.input || 'input';
    //    // fillText, strokeText
    //    this.type = obj.type || 'fillText';
    //
    //    // Angle de rotation
    //    this.angle = obj.angle || 0;
    //
    //    this.pos = obj.pos || {x:60, y:60};
    //    this.size = obj.size || {w:0, h:0};
    //  }
    //
    //  /**
    //   * Deplace l'obj d'un delta
    //   * @param vec
    //   */
    //  move(vect){
    //    for (var i = 0, l = this.points.length; i < l; i++){
    //      this.points[i].translate(vect);
    //    }
    //  }
    //
    //  rotate(angle){
    //    this.angle += angle;
    //  }
    //
    //  drawCanvas(ctx){
    //    ctx.save();
    //
    //    ctx.font =
    //      this.font.style + ' '
    //      + this.font.variant + ' '
    //      + this.font.weight + ' '
    //      + this.font.size + 'px' + ' '
    //      + this.font.family;
    //
    //    ctx.fillStyle = this.color;
    //
    //    ctx.translate(this.getX(), this.getY());
    //    ctx.rotate(this.angle * (2*Math.PI)/360.0);
    //
    //    switch(this.type) {
    //      case 'fillText':
    //      default:
    //        ctx.fillText(this.input, 0, 0);
    //        break;
    //      case 'strokeText':
    //        ctx.strokeText(this.input, 0, 0);
    //        break;
    //    }
    //
    //    var mes = ctx.measureText(this.input);
    //    this.setWidth(Math.round(mes.width));
    //    this.setHeight(parseInt(this.font.size));
    //
    //    ctx.restore();
    //  }
    //
    //  setSelected(selected) {
    //    this.isSelected = false;
    //  }
    //  setOverlapping(selected) {
    //    this.isOverlapping = false;
    //  }
    //}


    class Texte {
      constructor(obj, ctx){
        this.font = {
          style: obj.font.style || 'normal', // normal, italic, oblique.
          variant: obj.font.variant || 'normal', //normal, small-caps.
          weight: obj.font.weight || 'normal', // normal, bold, bolder, lighter, 100, 200 ... 900.
          baseline: obj.font.baseline || 'middle', // top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom",
          size: obj.font.size || '14',
          family: obj.font.family || 'sans-serif',
          color: obj.font.color || 'black'
        };
        this.margin = 20;
        this.color = obj.color || 'black';
        this.input = obj.input || 'input';
        // fillText, strokeText
        this.type = obj.type || 'fillText';
        //this.textAlign = obj.textAlign || 'left';

        // Angle de rotation
        this.angle = obj.angle || 0;
        this.createPoints(ctx);
      }

      createPoints(ctx){
        var mar, w, h;
        this.getSize(ctx);
        mar = this.margin;
        w = this.size.w;
        h = this.size.h;

        this.points = [
          new Point({x: 0, y: 0}),
          new Point({x: w + mar*2, y: 0}),
          new Point({x: w + mar*2, y: h + mar*2}),
          new Point({x: 0, y: h + mar*2})
        ];
      }
      /**
       * Aire d'un poly tester et c OK
       * @returns {number}
       */
      getArea() {
        var area = 0;
        for (var i = 0, l = this.points.length; i < l - 1 ; i++){
          area += this.points[i].x * this.points[i+1].y - this.points[i+1].x * this.points[i].y;
        }
        area += this.points[l-1].x * this.points[0].y - this.points[0].x * this.points[l-1].y;
        area /= 2;
        return area;
      }

      /**
       * Centre de masse d'un poly OK
       * @returns {{x: number, y: number}}
       */
      getCenter(){
        var area = this.getArea();

        var xg = 0, yg = 0, coef;

        for (var i = 0, l = this.points.length; i < l - 1 ; i++){
          coef = this.points[i].x * this.points[i+1].y - this.points[i+1].x * this.points[i].y;
          xg += (this.points[i].x + this.points[i+1].x) * coef;
          yg += (this.points[i].y + this.points[i+1].y) * coef;
        }
        coef = this.points[l-1].x * this.points[0].y - this.points[0].x * this.points[l-1].y;
        xg += (this.points[l-1].x + this.points[0].x) * coef;
        yg += (this.points[l-1].y + this.points[0].y) * coef;

        xg /= 6 * area;
        yg /= 6 * area;

        return {
          x: xg,
          y: yg
        }
      }
      getCenterX(){
        return this.getCenter().x;
      }
      getCenterY(){
        return this.getCenter().y;
      }
      /**
       * Deplace l'objet a la position donnée par le nouveau barycentre OK.
       * @param pos
       */
      moveTo(pos){
        var bary = this.getCenter();
        var vect = {x: pos.x - bary.x, y: pos.y - bary.y};
        this.move(vect);
      }

      /**
       * Deplace l'obj d'un delta
       * @param vec
       */
      move(vect){
        for (var i = 0, l = this.points.length; i < l; i++){
          this.points[i].translate(vect);
        }
      }

      findExtreme(){
        var posExtreme = {t:Infinity,r:-Infinity,b:-Infinity,l:Infinity};

        var saveExtreme = function(posExtreme, pos){
          posExtreme.t = Math.min(posExtreme.t, pos.y);
          posExtreme.r = Math.max(posExtreme.r, pos.x);
          posExtreme.b = Math.max(posExtreme.b, pos.y);
          posExtreme.l = Math.min(posExtreme.l, pos.x);
        };

        for (var i = 0, l = this.points.length; i < l; i++){
          saveExtreme(posExtreme, this.points[i]);
        }

        posExtreme.size = {w: posExtreme.r - posExtreme.l, h: posExtreme.b - posExtreme.t};
        return(posExtreme);
      }

      setSelected(selected) {
        this.isSelected = selected;
      }
      setOverlapping(overlap) {
        this.isOverlapping = overlap;
      }
      /**
       * Rotate un element.
       * @param angle en degre
       * @param C : position du centre de rotation.
       */
      rotate(angle, C){
        var i, l;

        // Barycentre.
        C = C || { x: this.getCenterX(), y: this.getCenterY()};

        // Tourne la forme
        for (i = 0, l = this.points.length; i < l; i++){
          this.points[i].rotate(angle, C);
        }
      }

      getSize(ctx){

        ctx.save();
        ctx.font =
          this.font.style + ' '
          + this.font.variant + ' '
          + this.font.weight + ' '
          + this.font.size + 'px' + ' '
          + this.font.family;

        //ctx.translate(center.x, center.y);
        ctx.rotate(this.angle * (2*Math.PI)/360.0);

        this.size = {
          w: ctx.measureText(this.input).width,
          h: parseInt(this.font.size)
        };

        ctx.restore();
      }

      drawHandler(ctx){
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 0, length = this.points.length; i < length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      drawCanvas(ctx){

        //var center = this.getCenter();
        ctx.save();

        ctx.font =
          this.font.style + ' '
          + this.font.variant + ' '
          + this.font.weight + ' '
          + this.font.size + 'px' + ' '
          + this.font.family;

        ctx.fillStyle = this.font.color;
        ctx.textBaseline = this.font.baseline;

        //ctx.translate(center.x, center.y);
        ctx.rotate(this.angle * (2*Math.PI)/360.0);

        switch(this.type) {
          case 'fillText':
          default:
            ctx.fillText(this.input, this.points[0].x + this.margin, this.points[0].y + this.size.h/2 + this.margin);
            break;
          case 'strokeText':
            ctx.strokeText(this.input, this.points[0].x + this.margin, this.points[0].y + this.size.h/2 + this.margin);
            break;
        }

        if (this.isSelected) {
          this.drawHandler(ctx);
        }

        ctx.restore();
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
              var posExtreme = this.entity.findExtreme();
              var newVal = canvasConversion.convertToPixel(value);
              this.entity.points[2].translate({x:0, y: newVal - posExtreme.size.h});
              this.entity.points[3].translate({x:0, y: newVal - posExtreme.size.h})
            };
            break;
          case 'bottom':
            this.setValue = function(value){
              var posExtreme = this.entity.findExtreme();
              var newVal = canvasConversion.convertToPixel(value);
              this.entity.points[1].translate({x:newVal - posExtreme.size.w, y: 0});
              this.entity.points[2].translate({x:newVal - posExtreme.size.w, y: 0})
            };
            break;
          default:
            console.log(loc + '--> terme non reconnu par le constructeur Arrow');
        }
      }

      setPos(loc){
        switch(loc) {
          case 'right':
            this.pos_start = new Point({
              x: this.entity.points[1].x + this.margin,
              y: this.entity.points[1].y
            });
            this.pos_end = new Point({
              x: this.entity.points[2].x + this.margin,
              y: this.entity.points[2].y
            });
            this.pos_box = new Point ({
              x: this.pos_start.x + 10,
              y: this.pos_start.y + (this.pos_end.y - this.pos_start.y)/2
            });
            this.value = canvasConversion.convertToMm(this.entity.points[2].y - this.entity.points[1].y);
            break;
          case 'bottom':
            this.pos_start = new Point({
              x: this.entity.points[3].x,
              y: this.entity.points[3].y + this.margin
            });
            this.pos_end = new Point({
              x: this.entity.points[2].x,
              y: this.entity.points[2].y + this.margin
            });
            this.pos_box = new Point({
              x: this.pos_start.x + (this.pos_end.x - this.pos_start.x)/2,
              y: this.pos_start.y + 20
            });
            this.value = canvasConversion.convertToMm(this.entity.points[2].x - this.entity.points[3].x);
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
              ctx.fillText(this.value + ' mm', this.pos_box.x, this.pos_box.y);
              ctx.restore();
            };

            this.drawCanvas = function(ctx){
              ctx.beginPath();
              ctx.fillRect(this.pos_start.x, this.pos_start.y + 5, 1, this.pos_end.y - this.pos_start.y - 5);
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
              ctx.fillText(this.value + ' mm', this.pos_box.x, this.pos_box.y);
              ctx.restore();
            };

            this.drawCanvas = function(ctx){
              ctx.beginPath();
              ctx.fillRect(this.pos_start.x + 5, this.pos_start.y, this.pos_end.x - this.pos_start.x - 5, 1);
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

    /**
     * Constructeur ArrowPoint : ne change les coordonnées que d'un seul point.
     */
    class ArrowPoint extends Arrow {
      constructor(entity, location){
        super(entity, location);
      }
      setMethods(loc){
        switch(loc) {
          case 'right':
            this.setValue = function(value){
              var newVal = canvasConversion.convertToPixel(value);
              this.entity.points[1].translate({x:0, y: (this.entity.points[2].y - this.entity.points[1].y) - newVal});
            };
            break;
          case 'bottom':
            this.setValue = function(value){
              var posExtreme = this.entity.findExtreme();
              var newVal = canvasConversion.convertToPixel(value);
              this.entity.points[1].translate({x:newVal - posExtreme.size.w, y: 0});
              this.entity.points[2].translate({x:newVal - posExtreme.size.w, y: 0})
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

      newArrowPoint: function (entity, location) {
        return new ArrowPoint(entity, location);
      },

      newMasterBoite: function (entity) {
        return new MasterBoite(entity);
      },

      newTexte: function(obj, ctx) {
        return new Texte(obj, ctx);
      },

      newPoly: function (entity) {
        return new Poly(entity);
      }
      
    };

  });
