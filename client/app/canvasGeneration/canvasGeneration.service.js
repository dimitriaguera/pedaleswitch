'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasGeneration', function (canvasConversion) {

    class Point {
      constructor(point){
        this.x = {v: point.x.v};
        this.y = {v: point.y.v};
      }
      translate(vector){

        //@todo a virer.
        if (vector.x.v){
          this.x.v += vector.x.v;
          this.y.v += vector.y.v;
        } else {
          this.x.v += vector.x;
          this.y.v += vector.y;
        }
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
        return this.x.v;
      }
      getY(){
        return this.y.v;
      }
      setX(value){
        this.x.v = value;
      }
      setY(value){
        this.y.v = value;
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
        
        this.pos = entity.pos;
        this.size = entity.size;
        this.old_size = entity.old_size;

        this.pos_default = entity.pos_default || null;
        this.points = entity.points;
        this.points_default = entity.points_default || null;
        this.initPoints(entity.points, this.points);
        this.initPoints(entity.points_default, this.points_default);
      }
      initPoints(points, tab){
        if (points) {
          var i;
          var l = this.points.length;
          var table = [];
          for (i = 0; i < l; i++) {
            table.push(new Point(this.points[i]));
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
              compos[i].points[j].x.v = this.points[0].x.v + compos[i].points_default[j].x.v ;
              compos[i].points[j].y.v = this.points[0].y.v + compos[i].points_default[j].y.v ;
            }

            // @todo a supprimer car cohabition de deux methodes.
            compos[i].pos.x.v = compos[i].points[0].x.v;
            compos[i].pos.y.v = compos[i].points[0].y.v;
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
          area += this.points[i].x.v * this.points[i+1].y.v - this.points[i+1].x.v * this.points[i].y.v;
        }
        area += this.points[l-1].x.v * this.points[0].y.v - this.points[0].x.v * this.points[l-1].y.v;
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
          coef = this.points[i].x.v * this.points[i+1].y.v - this.points[i+1].x.v * this.points[i].y.v;
          xg += (this.points[i].x.v + this.points[i+1].x.v) * coef;
          yg += (this.points[i].y.v + this.points[i+1].y.v) * coef;
        }
        coef = this.points[l-1].x.v * this.points[0].y.v - this.points[0].x.v * this.points[l-1].y.v;
        xg += (this.points[l-1].x.v + this.points[0].x.v) * coef;
        yg += (this.points[l-1].y.v + this.points[0].y.v) * coef;

        xg /= 6 * area;
        yg /= 6 * area;

        return {
          x: xg,
          y: yg
        }
      }
      
      /**
       * Deplace l'objet a la position donnée par le nouveau barycentre OK.
       * @param pos
       */
      moveTo(pos){
        var bary = this.getCenter();
        var vect = {x: pos.x - bary.x, y: pos.y - bary.y};
        for (var i = 0, l = this.points.length; i < l; i++){
          this.points[i].translate(vect);
        }
        //@todo a supprimer car cohabitation de deux coordonnée.
        this.pos.x.v = this.points[0].x.v;
        this.pos.y.v = this.points[0].y.v;
      }

      /**
       * Deplace l'obj d'un delta
       * @param vec
       */
      move(vect){
        for (var i = 0, l = this.points.length; i < l; i++){
          this.points[i].translate(vect);
        }
        //@todo a supprimer car cohabitation de deux coordonnée.
        this.pos.x.v = this.points[0].x.v;
        this.pos.y.v = this.points[0].y.v;
      }
      setX(coord){
        this.points[0].x.v = coord;
      }
      setY(coord){
        this.points[0].x.v = coord;
      }
      getX() {
        return this.points[0].x.v;
      }
      getY() {
        return this.points[0].y.v;
      }
      getHeight() {
        return this.size.h.v;
      }
      getWidth() {
        return this.size.w.v;
      }
      setHeight(h) {
        this.size.h.v = h;
      }
      setWidth(w) {
        this.size.w.v = w;
      }
      getCenterX(){
        return this.getCenter().x;
        //return this.getX() + (this.getWidth() / 2);
      }
      getCenterY(){
        return this.getCenter().y;
        //return this.getY() + (this.getHeight() / 2);
      }
      setCenterX(center){
        this.setX(center - (this.getWidth() / 2));
      }
      setCenterY(center){
        this.setY(center - (this.getHeight() / 2));
      }
      // @todo a check get radius pour rectangle ?
      getRadius(){
        return this.getWidth() / 2;
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.getWidth();
      }
      getBottom() {
        return this.getY() + this.getHeight();
      }
      getMax(){
        return {
          t: this.getTop(),
          r: this.getRight(),
          b: this.getBottom(),
          l: this.getLeft()
        }
      }
      getBoundingBoxPoints() {
        // Bords du rectangle.
        // 0 haut gauche, 1 haut droit, 2 bas droit, 3 bas gauche.
        return ([
          { x: this.getX(),  y: this.getY() },
          { x: this.getX() + this.getWidth(), y: this.getY() },
          { x: this.getX() + this.getWidth(), y: this.getY() + this.getHeight() },
          { x: this.getX(), y: this.getY() + this.getHeight() }
        ]);
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
        var newpoint;
        var points, point;
        var old_size, old_pos;

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
                this.composants[i].points_default[j].x.v = this.composants[i].points[j].x.v - this.points[0].x.v;
                this.composants[i].points_default[j].y.v = this.composants[i].points[j].y.v - this.points[0].y.v;
              }
            }
          }
          // Si debrayable doit appliquer un rotation au composant qui serait virtuellement dans cette
          // position si cela n'avait pas été débrayable afin de remettre le composant à la bonne place
          // si l'utilisateur switch de debrayable à non.
          else {
            for (i = 0; i < this.composants.length; i++) {
              // Rotation 90 a droite.
              if (angle < 0) {
                // Coordonnée dans le repère du rect avant rotation.
                point = {
                  x: this.composants[i].pos_default.x.v,
                  y: this.composants[i].pos_default.y.v + this.composants[i].getHeight()
                };
              }
            }
          }
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
        ctx.moveTo(this.points[0].x.v, this.points[0].y.v);
        for (var item = 0, length = this.points.length; item < length; item += 1) {
          ctx.lineTo(this.points[item].x.v, this.points[item].y.v);
        }
        ctx.closePath();
        ctx.stroke();
        if (this.isOverlapping) {
          ctx.fillStyle = "rgba(255, 00, 00, 0.2)";
          ctx.fill();
        }
      }
    }

    /**
     * Constructeur de la classe MasterBoite.
     */
    class MasterBoite {
      constructor(entity) {
        this.margin = {v: 5};
        this.initialHeight = {v: 40};
        this.size = {
          w: {v: null},
          h: {v: null},
          d: {v: null},
          d1: {v: 200},
          d2: {v: 300}
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
        this.size[side].v = value;
      }

      getSide(side){
        return this.size[side].v;
      }

      initBoiteWithEffect(entity){
        var d = entity.size.h.v + 2 * this.margin.v;
        var w = entity.size.w.v + 2 * this.margin.v;
        var d3 = this.getSide('d2') - this.getSide('d1');
        this.setSide('w', w);
        this.setSide('d', d);
        this.setSide('h', Math.sqrt(d*d - d3*d3));
      }

      convertMargin() {
        this.margin.v = canvasConversion.convertToPixel(this.margin.v);
      }

      convertInitialHeight() {
        this.initialHeight.v = canvasConversion.convertToPixel(this.initialHeight.v);
      }

      createProjectionsCoords(state) {
        var proj_points = {
          top: {
            points: {
              p0: {
                x: {v: 0},
                y: {v: 0}
              },
              p1: {
                x: {v: this.getSide('w')},
                y: {v: 0}
              },
              p2: {
                x: {v: this.getSide('w')},
                y: {v: this.getSide('d2')}
              },
              p3: {
                x: {v: 0},
                y: {v: this.getSide('d2')}
              }
            }
          },
          bottom: {
            points: {
              p0: {
                x: {v: 0},
                y: {v: 0}
              },
              p1: {
                x: {v: this.getSide('w')},
                y: {v: 0}
              },
              p2: {
                x: {v: this.getSide('w')},
                y: {v: this.getSide('d1')}
              },
              p3: {
                x: {v: 0},
                y: {v: this.getSide('d1')}
              }
            }
          },
          up: {
            points: {
              p0: {
                x: {v: 0},
                y: {v: 0}
              },
              p1: {
                x: {v: this.getSide('w')},
                y: {v: 0}
              },
              p2: {
                x: {v: this.getSide('w')},
                y: {v: this.getSide('d')}
              },
              p3: {
                x: {v: 0},
                y: {v: this.getSide('d')}
              }
            }
          },
          down: {
            points: {
              p0: {
                x: {v: 0},
                y: {v: 0}
              },
              p1: {
                x: {v: this.getSide('w')},
                y: {v: 0}
              },
              p2: {
                x: {v: this.getSide('w')},
                y: {v: this.getSide('h')}
              },
              p3: {
                x: {v: 0},
                y: {v: this.getSide('h')}
              }
            }
          },
          left: {
            points: {
              p0: {
                x: {v: 0},
                y: {v: 0}
              },
              p1: {
                x: {v: this.getSide('h')},
                y: {v: this.getSide('d2') - this.getSide('d1')}
              },
              p2: {
                x: {v: this.getSide('h')},
                y: {v: this.getSide('d2')}
              },
              p3: {
                x: {v: 0},
                y: {v: this.getSide('d2')}
              }
            }
          },
          right: {
            points: {
              p0: {
                x: {v: 0},
                y: {v: 0}
              },
              p1: {
                x: {v: this.getSide('h')},
                y: {v: this.getSide('d1') - this.getSide('d2')}
              },
              p2: {
                x: {v: this.getSide('h')},
                y: {v: this.getSide('d1')}
              },
              p3: {
                x: {v: 0},
                y: {v: this.getSide('d1')}
              }
            }
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
        var coords = this.createProjectionsCoords(state).points;
        var points = this.projections[state].points;

        points.p0.setX(coords.p0.x.v);
        points.p1.setX(coords.p1.x.v);
        points.p2.setX(coords.p2.x.v);
        points.p3.setX(coords.p3.x.v);

        points.p0.setY(coords.p0.y.v);
        points.p1.setY(coords.p1.y.v);
        points.p2.setY(coords.p2.y.v);
        points.p3.setY(coords.p3.y.v);
      }
      updateMaster(state){
        var proj, h, d1, d2, d3;
        switch (state) {
          case 'top':
            proj = this.createProjectionsCoords(state);
            this.setSide('w', proj.points.p1.x.v - proj.points.p0.x.v);
            this.setSide('d2', proj.points.p3.y.v - proj.points.p0.y.v);
            break;
          case 'bottom':
            proj = this.createProjectionsCoords(state);
            this.setSide('w', proj.points.p1.x.v - proj.points.p0.x.v);
            this.setSide('d1', proj.points.p3.y.v - proj.points.p0.y.v);
            break;
          case 'up':
            proj = this.createProjectionsCoords(state);
            this.setSide('w', proj.points.p1.x.v - proj.points.p0.x.v);
            this.setSide('d', proj.points.p3.y.v - proj.points.p0.y.v);
            break;
          case 'down':
            proj = this.createProjectionsCoords(state);
            this.setSide('w', proj.points.p1.x.v - proj.points.p0.x.v);
            this.setSide('h', proj.points.p3.y.v - proj.points.p0.y.v);
            break;
          case 'left':
            proj = this.createProjectionsCoords(state);
            h = proj.points.p2.x.v - proj.points.p3.x.v;
            d2 = proj.points.p3.y.v - proj.points.p0.y.v;
            d1 = proj.points.p2.y.v - proj.points.p1.y.v;
            d3 = d2 - d1;
            this.setSide('h', h);
            this.setSide('d', Math.sqrt(h*h + d3*d3));
            this.setSide('d1', d1);
            this.setSide('d2', d2);
            break;
          case 'right':
            proj = this.createProjectionsCoords(state);
            h = proj.points.p2.x.v - proj.points.p3.x.v;
            d1 = proj.points.p3.y.v - proj.points.p0.y.v;
            d2 = proj.points.p2.y.v - proj.points.p1.y.v;
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
        // @todo : size a supprimer.
        this.size = {
          w: {v: null},
          h: {v: null}
        };
        this.pos = {
          x: {v: 200},
          y: {v: 200}
        };
        this.isSelected = false;
        this.isOverlapping = false;
        this.titre = 'Boite';
        this.effets = [];
        this.composants = [];
        this.initPointsPosition(proj_points.points);
      }

      initPointsPosition(points){
        this.points = {
          p0: new Point(points.p0),
          p1: new Point(points.p1),
          p2: new Point(points.p2),
          p3: new Point(points.p3)
        }
      }
      initMoveBox(entity){
        this.pos.x.v = entity.pos.x.v;
        this.pos.y.v = entity.pos.y.v;
        this.points.p0.translate(this.pos);
        this.points.p1.translate(this.pos);
        this.points.p2.translate(this.pos);
        this.points.p3.translate(this.pos);
      }
      moveBox(){
        this.points.p0.translate(this.pos);
        this.points.p1.translate(this.pos);
        this.points.p2.translate(this.pos);
        this.points.p3.translate(this.pos);
      }

      // Redimensionne la boite si le nouvel effet est en dehors.
      checkBorderBoite(entity){
        if (entity.getX() < (this.getX() + this.margin.v)){
          var old_pos_x = this.getX();
          this.setX(entity.getX() - this.margin.v);
          this.setWidth(this.getWidth() + (old_pos_x - entity.getX()) + this.margin.v);
        }
        if (entity.getY() < (this.getY() + this.margin.v)){
          var old_pos_y = this.getY();
          this.setY(entity.getY() - this.margin.v);
          this.setHeight(this.getHeight() + (old_pos_y - entity.getY()) + this.margin.v);
        }
        if ((entity.getX() + entity.getWidth()) > (this.getX() + this.getWidth() - this.margin.v)){
          this.setWidth((entity.getX() + entity.getWidth()) - this.getX() + this.margin.v);
        }
        if ((entity.getY() + entity.getHeight()) > (this.getY() + this.getHeight() - this.margin.v)){
          this.setHeight((entity.getY() + entity.getHeight()) - this.getY() + this.margin.v);
        }
      }

      moveEffetCompo(delta){
        var effets = this.effets, compos, i, j;
        if(effets.length !== 0) {
          for (i = 0; i < effets.length; i++) {
            effets[i].setX(delta.deltaX + effets[i].getX());
            effets[i].setY(delta.deltaY + effets[i].getY());

            compos = effets[i].composants;
            if(compos.length !== 0) {
              for (j = 0; j < compos.length; j++) {
                compos[j].setX(delta.deltaX + compos[j].getX());
                compos[j].setY(delta.deltaY + compos[j].getY());
              }
            }
          }
        }
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
      getHeight() {
        return this.size.h.v;
      }
      getWidth() {
        return this.size.w.v;
      }
      setHeight(h) {
        this.size.h.v = h;
      }
      setWidth(w) {
        this.size.w.v = w;
      }
      getCenterX(){
        return this.getX() + (this.getWidth() / 2);
      }
      getCenterY(){
        return this.getY() + (this.getHeight() / 2);
      }
      setCenterX(center){
        this.setX(center - (this.getWidth() / 2));
      }
      setCenterY(center){
        this.setY(center - (this.getHeight() / 2));
      }
      getRadius(){
        return this.getWidth() / 2;
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.getWidth();
      }
      getBottom() {
        return this.getY() + this.getHeight();
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
        ctx.moveTo(this.points.p0.getX(), this.points.p0.getY());
        ctx.lineTo(this.points.p1.getX(), this.points.p1.getY());
        ctx.lineTo(this.points.p2.getX(), this.points.p2.getY());
        ctx.lineTo(this.points.p3.getX(), this.points.p3.getY());
        ctx.closePath();
        ctx.stroke();
      }
    }

    class Poly {
      points = [
        {x:40 , y:70},
        {x:60 , y:50},
        {x:90 , y:70},
        {x:80 , y:90},
        {x:90 , y:100}
      ];

      size = {};
      
      resetCompPos(){

      }
      drawCanvas(ctx){
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var item = 0, length = this.points.length; item < length; item += 1) {
          ctx.lineTo(this.points[item].x, this.points[item].y);
        }
        ctx.closePath();

        ctx.stroke();
      }

      setX(coord){
        this.pos.x.v = coord;
      }
      setY(coord){
        this.pos.y.v = coord;
      }
      getX() {
        return this.points[0].x;
      }
      getY() {
        return this.points[0].y;
      }
      getHeight() {
        return this.size.h;
      }
      getWidth() {
        return this.size.w;
      }
      setHeight(h) {
        this.size.h = h;
      }
      setWidth(w) {
        this.size.w = w;
      }
      setCenterX(center){
        this.setX(center - (this.getWidth() / 2));
      }
      setCenterY(center){
        this.setY(center - (this.getHeight() / 2));
      }
      getCenterX(){
        return this.getX() + (this.getWidth() / 2);
      }
      getCenterY(){
        return this.getY() + (this.getHeight() / 2);
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.getWidth();
      }
      getBottom() {
        return this.getY() + this.getHeight();
      }
      setSelected(selected) {
        this.isSelected = false;
      }
      setOverlapping(selected) {
        this.isOverlapping = false;
      }
      
    }

    class Texte {
      constructor(obj){

        this.font = {};

        // normal, italic, oblique
        this.font.style = obj.font.style || 'normal';
        //normal, small-caps
        this.font.variant = obj.font.variant || 'normal';
        // normal, bold, bolder, lighter, 100, 200 ... 900.
        this.font.weight = obj.font.weight || 'normal';
        this.font.size = obj.font.size || '14';
        this.font.family = obj.font.family || 'sans-serif';
        //this.textAlign = obj.textAlign || 'left';
        this.color = obj.color || 'black';
        this.input = obj.input || 'input';
        // fillText, strokeText
        this.type = obj.type || 'fillText';

        // Angle de rotation
        this.angle = obj.angle || 0;

        this.pos = obj.pos || {x:{v:60}, y:{v:60}};
        this.size = obj.size || {w:{v:0}, h:{v:0}};
      }

      /**
       * Deplace l'obj d'un delta
       * @param vec
       */
      move(vect){
        for (var i = 0, l = this.points.length; i < l; i++){
          this.points[i].translate(vect);
        }
        //@todo a supprimer car cohabitation de deux coordonnée.
        this.pos.x.v = this.points[0].x.v;
        this.pos.y.v = this.points[0].y.v;
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
      getHeight() {
        return this.size.h.v;
      }
      getWidth() {
        return this.size.w.v;
      }
      setHeight(h) {
        this.size.h.v = h;
      }
      setWidth(w) {
        this.size.w.v = w;
      }
      setCenterX(center){
        this.setX(center - (this.getWidth() / 2));
      }
      setCenterY(center){
        this.setY(center - (this.getHeight() / 2));
      }
      getCenterX(){
        return this.getX() + (this.getWidth() / 2);
      }
      getCenterY(){
        return this.getY() + (this.getHeight() / 2);
      }
      getLeft() {
        return this.getX();
      }
      getTop() {
        return this.getY();
      }
      getRight() {
        return this.getX() + this.getWidth();
      }
      getBottom() {
        return this.getY() + this.getHeight();
      }
      rotate(angle){
        this.angle += angle;
      }
      drawCanvas(ctx){
        ctx.save();

        ctx.font =
          this.font.style + ' '
          + this.font.variant + ' '
          + this.font.weight + ' '
          + this.font.size + 'px' + ' '
          + this.font.family;

        ctx.fillStyle = this.color;

        ctx.translate(this.getX(), this.getY());
        ctx.rotate(this.angle * (2*Math.PI)/360.0);
        
        switch(this.type) {
          case 'fillText':
          default:
            ctx.fillText(this.input, 0, 0);
            break;
          case 'strokeText':
            ctx.strokeText(this.input, 0, 0);
            break;
        }

        var mes = ctx.measureText(this.input);
        this.setWidth(Math.round(mes.width));
        this.setHeight(parseInt(this.font.size));

        ctx.restore();
      }
      setSelected(selected) {
        this.isSelected = false;
      }
      setOverlapping(selected) {
        this.isOverlapping = false;
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

      newMasterBoite: function (entity) {
        return new MasterBoite(entity);
      },

      newTexte: function(obj) {
        return new Texte(obj);
      },

      newPoly: function (entity) {
        return new Poly(entity);
      }
      
    };

  });
