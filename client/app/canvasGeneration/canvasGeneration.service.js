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

        this.fonction = 'effet';
        this.angle = entity.angle || 0;
        this.size = {};
        
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

        this.size.w = posExtreme.size.w;
        this.size.h = posExtreme.size.h;

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
              this.composants[i].changeShape();
              this.composants[i].angle += angle;
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

        // Met à jour la propriété angle.
        this.angle += angle;
        this.changeShape();

        // Met à jour la propriété size.
        this.findExtreme();
      }

      changeShape(){
        // Change la forme de l'obj rectangle si pas // a l'axe.
        if (this.constructor.name === 'Rect'){
          if (this.angle%90 === 0) {
            this.shapeObject = 'Rect';
          }
          else {
            this.shapeObject = 'Poly';
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
        return Math.sqrt((this.points[0].x - this.points[1].x) * (this.points[0].x - this.points[1].x) + (this.points[0].y - this.points[1].y) * (this.points[0].y - this.points[1].y)) / 2
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
        this.shapeObject = entity.shapeObject || 'Rect';
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
        
        this.fonction = 'MasterBoite';
        this.shapeObject = 'Rect';
        
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

      /**
       * Teste les collisions axe Y boite/contenu sur chaque projection de la boite.
       * La projection down (dessous de boite) n'est pas testée.
       *
       * @param state : état de la vue . up, down, lest, right, top, bottom.
       * @param mousePos : position x et y  de la souris.
       * @param index : index du point de référence - 0, 1, 2, 3.
       *                Le point de référence est le sommet de la
       *                projection de boite qui est bougé dans la
       *                vue active.
       * @returns {false || Number}
       */
      projectionsCollisionY(state, mousePos, index){

        var delta, up, left, right, top, bottom, ref, move, func, i, delta_hypo, hypo, adj, test_tmp;
        var cosinus = this.size.h / this.size.d;
        var opp = (this.size.d2 - this.size.d1);
        var tmp_cos = 1;

        var test = 0;
        var execute = [];

        up = this.projections.up;
        left = this.projections.left;
        right = this.projections.right;
        top = this.projections.top;
        bottom = this.projections.bottom;

        var getTriangleSide = function(hypo, side){
          return Math.sqrt(hypo * hypo - side * side);
        };

        var getTriangleHypo = function(adj, opp){
          return Math.sqrt(adj * adj + opp * opp);
        };

        switch (state) {
          case 'up':

            // Test de la projection LEFT.
            // On calcul le delta de deplacement de la bordure.
            //hypo = (up.points[3].y - up.points[0].y) - (mousePos.y - up.points[index].y);
            //adj = getTriangleSide(hypo, opp);
            //delta = (left.points[1].x - left.points[0].x) - adj;

            cosinus = (left.points[1].x - left.points[0].x)  / ((up.points[3].y - up.points[0].y) - (mousePos.y - up.points[index].y));
            delta = (mousePos.y - up.points[index].y) * cosinus;
            ref = ((index - 1) >= 0) ? index - 1 : 3;

            // Si deplacement bord gauche de la projection LEFT.
            if (ref === 0 || ref === 3) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = left.points[ref].x + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > left.size_proj_mini.l - this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, left.points[1].x - (left.size_proj_mini.l - this.margin));
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? left.points[1].x - value : value;
                  left.points[0].setX(v || m);
                  left.points[3].setX(v || m);
                }
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord droit de la projection LEFT.
            else {

              move = left.points[ref].x + delta;

              if (move < left.size_proj_mini.r + this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, (left.size_proj_mini.r + this.margin) - left.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? left.points[0].x + value : value;
                  left.points[1].setX(v || m);
                  left.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Test de la projection RIGHT.
            // On calcul le delta de deplacement de la bordure.

            ref = ((index + 1) < 4) ? index + 1 : 0;

            // Si deplacement bord gauche de la projection RIGHT.
            if (ref === 0 || ref === 3) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = right.points[ref].x - delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > right.size_proj_mini.l - this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, right.points[1].x - (right.size_proj_mini.l - this.margin));
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? right.points[1].x - value : value;
                  right.points[0].setX(v || m);
                  right.points[3].setX(v || m);
                }
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord droit de la projection RIGHT.
            else {

              move = right.points[ref].x - delta;

              if (move < right.size_proj_mini.r + this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, (right.size_proj_mini.r + this.margin) - right.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? right.points[0].x + value : value;
                  right.points[1].setX(v || m);
                  right.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(var i in execute){
                execute[i](test);
              }
              return getTriangleHypo(test, opp);
            }
            else {
              for(var i in execute){
                execute[i]();
              }
              up.setOverlapping(false);
              return false;
            }

          case 'left':

            delta = mousePos.y - left.points[index].y;
            cosinus = (left.points[1].x - left.points[0].x)  / ((up.points[3].y - up.points[0].y) - (mousePos.y - up.points[index].y));
            ref = index;

            // Test de la projection TOP
            // Si deplacement bord haut de la projection TOP.
            if (ref === 0 || ref === 1) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = top.points[ref].y + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > top.size_proj_mini.t - this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, top.points[3].y - (top.size_proj_mini.t - this.margin));
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? top.points[3].y - value : value;
                  top.points[0].setY(v || m);
                  top.points[1].setY(v || m);
                }
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord bas de la projection TOP.
            else {

              move = top.points[ref].y + delta;

              if (move < top.size_proj_mini.b + this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, (top.size_proj_mini.b + this.margin) - top.points[0].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[0].y + value : value;
                  top.points[2].setY(v || m);
                  top.points[3].setY(v || m);
                }
              };

              execute.push(func());
            }

            // Test de la projection BOTTOM
            // Si deplacement bord haut de la projection BOTTOM.
            if (ref === 0 || ref === 1) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = bottom.points[ref].y + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > bottom.size_proj_mini.t - this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, bottom.points[3].y - (bottom.size_proj_mini.t - this.margin));
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? bottom.points[3].y - value : value;
                  bottom.points[0].setY(v || m);
                  bottom.points[1].setY(v || m);
                }
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord bas de la projection BOTTOM.
            else {

              move = bottom.points[ref].y + delta;

              if (move < bottom.size_proj_mini.b + this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, (bottom.size_proj_mini.b + this.margin) - bottom.points[0].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[0].y + value : value;
                  bottom.points[2].setY(v || m);
                  bottom.points[3].setY(v || m);
                }
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(var i in execute){
                execute[i](test);
              }
              return getTriangleHypo(test, opp);
            }
            else {
              for(var i in execute){
                execute[i]();
              }
              left.setOverlapping(false);
              return false;
            }

          case 'right':

            delta = mousePos.y - right.points[index].y;
            cosinus = (right.points[1].x - right.points[0].x)  / ((up.points[3].y - up.points[0].y) - (mousePos.y - up.points[index].y));
            ref = index;

            // Test de la projection TOP
            // Si deplacement bord haut de la projection TOP.
            if (ref === 0 || ref === 1) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = top.points[ref].y + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > top.size_proj_mini.t - this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, top.points[3].y - (top.size_proj_mini.t - this.margin));
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? top.points[3].y - value : value;
                  top.points[0].setY(v || m);
                  top.points[1].setY(v || m);
                }
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord bas de la projection TOP.
            else {

              move = top.points[ref].y + delta;

              if (move < top.size_proj_mini.b + this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, (top.size_proj_mini.b + this.margin) - top.points[0].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[0].y + value : value;
                  top.points[2].setY(v || m);
                  top.points[3].setY(v || m);
                }
              };

              execute.push(func());
            }

            // Test de la projection BOTTOM
            // Si deplacement bord haut de la projection BOTTOM.
            if (ref === 0 || ref === 1) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = bottom.points[ref].y + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > bottom.size_proj_mini.t - this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, bottom.points[3].y - (bottom.size_proj_mini.t - this.margin));
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? bottom.points[3].y - value : value;
                  bottom.points[0].setY(v || m);
                  bottom.points[1].setY(v || m);
                }
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord bas de la projection BOTTOM.
            else {

              move = bottom.points[ref].y + delta;

              if (move < bottom.size_proj_mini.b + this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, (bottom.size_proj_mini.b + this.margin) - bottom.points[0].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[0].y + value : value;
                  bottom.points[2].setY(v || m);
                  bottom.points[3].setY(v || m);
                }
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(var i in execute){
                execute[i](test);
              }
              return getTriangleHypo(test, opp);
            }
            else {
              for(var i in execute){
                execute[i]();
              }
              right.setOverlapping(false);
              return false;
            }

          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      }

      /**
       * Teste les collisions axe X boite/contenu sur chaque projection de la boite.
       * La projection down (dessous de boite) n'est pas testée.
       *
       * @param state : état de la vue . up, down, lest, right, top, bottom.
       * @param mousePos : position x et y  de la souris.
       * @param index : index du point de référence - 0, 1, 2, 3.
       *                Le point de référence est le sommet de la
       *                projection de boite qui est bougé dans la
       *                vue active.
       * @returns {false || Number}
       */
      projectionsCollisionX(state, mousePos, index){

        var delta, up, left, right, top, bottom, ref, move, func, i, test_tmp;
        var cosinus = this.size.h / this.size.d;
        var tmp_cos = 1;

        var test = 0;
        var execute = [];

        up = this.projections.up;
        left = this.projections.left;
        right = this.projections.right;
        top = this.projections.top;
        bottom = this.projections.bottom;

        switch (state) {
          case 'top':
            // Test de la projection UP.
            // On calcul le delta de deplacement de la bordure.
            delta = mousePos.x - top.points[index].x;
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection UP.
            if (ref === 0 || ref === 3) {

              move = up.points[ref].x - delta;

              if (move > up.size_proj_mini.l - this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, up.points[1].x - (up.size_proj_mini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[1].x - value : value;
                  up.points[0].setX(v || m);
                  up.points[3].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection UP.
            else {

              move = up.points[ref].x - delta;

              if (move < up.size_proj_mini.r + this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, (up.size_proj_mini.r + this.margin) - up.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[0].x + value : value;
                  up.points[1].setX(v || m);
                  up.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Test de la projection BOTTOM.
            // On calcul le delta de deplacement de la bordure.
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection BOTTOM.
            if (ref === 0 || ref === 3) {

              move = bottom.points[ref].x - delta;

              if (move > bottom.size_proj_mini.l - this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, bottom.points[1].x - (bottom.size_proj_mini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[1].x - value : value;
                  bottom.points[0].setX(v || m);
                  bottom.points[3].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection BOTTOM.
            else {

              move = bottom.points[ref].x - delta;

              if (move < bottom.size_proj_mini.r + this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, (bottom.size_proj_mini.r + this.margin) - bottom.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[0].x + value : value;
                  bottom.points[1].setX(v || m);
                  bottom.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(var i in execute){
                execute[i](test);
              }
              return test;
            }
            else {
              for(var i in execute){
                execute[i]();
              }
              top.setOverlapping(false);
              return false;
            }

          case 'bottom':
            // Test de la projection UP.
            // On calcul le delta de deplacement de la bordure.
            delta = mousePos.x - bottom.points[index].x;
            ref = index;

            // Si deplacement bord gauche de la projection UP.
            if (ref === 0 || ref === 3) {

              move = up.points[ref].x + delta;

              if (move > up.size_proj_mini.l - this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, up.points[1].x - (up.size_proj_mini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[1].x - value : value;
                  up.points[0].setX(v || m);
                  up.points[3].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection UP.
            else {

              move = up.points[ref].x + delta;

              if (move < up.size_proj_mini.r + this.margin) {
                bottom.setOverlapping(true);
                test = Math.max(test, (up.size_proj_mini.r + this.margin) - up.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[0].x + value : value;
                  up.points[1].setX(v || m);
                  up.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Test de la projection TOP.
            // On calcul le delta de deplacement de la bordure.
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection TOP.
            if (ref === 0 || ref === 3) {

              move = top.points[ref].x - delta;

              if (move > top.size_proj_mini.l - this.margin) {
                bottom.setOverlapping(true);
                test = Math.max(test, top.points[1].x - (top.size_proj_mini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[1].x - value : value;
                  top.points[0].setX(v || m);
                  top.points[3].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection TOP.
            else {

              move = top.points[ref].x - delta;

              if (move < top.size_proj_mini.r + this.margin) {
                bottom.setOverlapping(true);
                test = Math.max(test, (top.size_proj_mini.r + this.margin) - top.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[0].x + value : value;
                  top.points[1].setX(v || m);
                  top.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(var i in execute){
                execute[i](test);
              }
              return test;
            }
            else {
              for(var i in execute){
                execute[i]();
              }
              bottom.setOverlapping(false);
              return false;
            }

          case 'up':

            // Test de la projection TOP.
            // On calcul le delta de deplacement de la bordure.
            delta = mousePos.x - up.points[index].x;
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection TOP.
            if (ref === 0 || ref === 3) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = top.points[ref].x - delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > top.size_proj_mini.l - this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, top.points[1].x - (top.size_proj_mini.l - this.margin));
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? top.points[1].x - value : value;
                  top.points[0].setX(v || m);
                  top.points[3].setX(v || m);
                }
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord droit de la projection TOP.
            else {

              move = top.points[ref].x - delta;

              if (move < top.size_proj_mini.r + this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, (top.size_proj_mini.r + this.margin) - top.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[0].x + value : value;
                  top.points[1].setX(v || m);
                  top.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Test de la projection BOTTOM.
            // On calcul le delta de deplacement de la bordure.
            ref = index;

            // Si deplacement bord gauche de la projection BOTTOM.
            if (ref === 0 || ref === 3) {

              move = bottom.points[ref].x + delta;

              if (move > bottom.size_proj_mini.l - this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, bottom.points[1].x - (bottom.size_proj_mini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[1].x - value : value;
                  bottom.points[0].setX(v || m);
                  bottom.points[3].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection BOTTOM.
            else {

              move = bottom.points[ref].x + delta;

              if (move < bottom.size_proj_mini.r + this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, (bottom.size_proj_mini.r + this.margin) - bottom.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[0].x + value : value;
                  bottom.points[1].setX(v || m);
                  bottom.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(var i in execute){
                execute[i](test);
              }
              return test;
            }
            else {
              for(var i in execute){
                execute[i]();
              }
              up.setOverlapping(false);
              return false;
            }

          case 'left':
            // Test de la projection UP.
            // On calcul le delta de deplacement de la bordure.
            delta = (mousePos.x - left.points[index].x) / cosinus;
            ref = ((index + 1) <= 3) ? index + 1 : 0;

            // Si deplacement bord bas de la projection UP.
            if (ref === 3 || ref === 2) {

              move = up.points[ref].y + delta;

              if (move < up.size_proj_mini.b + this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, (up.size_proj_mini.b + this.margin) - up.points[0].y);
                tmp_cos = cosinus;
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[0].y + value : value;
                  up.points[2].setY(v || m);
                  up.points[3].setY(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord haut de la projection UP.
            else {

              move = up.points[ref].y + delta;

              if (move > up.size_proj_mini.t - this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, up.points[3].y - (up.size_proj_mini.t - this.margin));
                tmp_cos = cosinus;
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[3].y - value : value;
                  up.points[0].setY(v || m);
                  up.points[1].setY(v || m);
                }
              };

              execute.push(func());
            }

            // Test de la projection RIGHT
            // On calcul le delta de deplacement de la bordure.
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection RIGHT.
            if (ref === 0 || ref === 3) {

              move = right.points[ref].x - delta;

              if (move > right.size_proj_mini.l - this.margin) {
                left.setOverlapping(true);
                // si la limite a été atteinte sur l'hypotenuse auparavant.
                if (test !== 0 && tmp_cos < 1){
                  test_tmp = Math.max(test, (right.points[1].x - (right.size_proj_mini.l - this.margin)) / cosinus);
                  // si la limite actuelle passe avant celle de l'hypothenuse.
                  if (test_tmp > test){
                    tmp_cos = 1;
                    test = right.points[1].x - (right.size_proj_mini.l - this.margin);
                  }
                }
                // Si pas de limite sur l'hypothenuse auparavant, test standard.
                else {
                  test = Math.max(test, right.points[1].x - (right.size_proj_mini.l - this.margin));
                }
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? right.points[1].x - value : value;
                  right.points[0].setX(v || m);
                  right.points[3].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection RIGHT.
            else {

              move = right.points[ref].x - delta;

              if (move < right.size_proj_mini.r + this.margin) {
                left.setOverlapping(true);
                // si la limite a été atteinte sur l'hypotenuse auparavant.
                if (test !== 0 && tmp_cos < 1){
                  test_tmp = Math.max(test, ((right.size_proj_mini.r + this.margin) - right.points[0].x) / cosinus);
                  // si la limite actuelle passe avant celle de l'hypothenuse.
                  if (test_tmp > test){
                    tmp_cos = 1;
                    test = (right.size_proj_mini.r + this.margin) - right.points[0].x;
                  }
                }
                // Si pas de limite sur l'hypothénuse auparavant, test standard.
                else {
                  test = Math.max(test, (right.size_proj_mini.r + this.margin) - right.points[0].x);
                }
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? right.points[0].x + value : value;
                  right.points[1].setX(v || m);
                  right.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(var i in execute){
                execute[i](test);
              }
              return test * tmp_cos;
            }
            else {
              for(var i in execute){
                execute[i]();
              }
              left.setOverlapping(false);
              return false;
            }

          case 'right':
            // Test de la projection UP.
            // On calcul le delta de deplacement de la bordure.
            delta = (mousePos.x - right.points[index].x) / cosinus;
            ref = ((index - 1) >= 0) ? index - 1 : 3;

            // Si deplacement bord bas de la projection UP.
            if (ref === 3 || ref === 2) {

              move = up.points[ref].y - delta;

              if (move < up.size_proj_mini.b + this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, (up.size_proj_mini.b + this.margin) - up.points[0].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[0].y + value : value;
                  up.points[3].setY(v || m);
                  up.points[2].setY(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord haut de la projection UP.
            else {

              move = up.points[ref].y - delta;

              if (move > up.size_proj_mini.t - this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, up.points[3].y - (up.size_proj_mini.t - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[3].y - value : value;
                  up.points[0].setY(v || m);
                  up.points[1].setY(v || m);
                }
              };

              execute.push(func());
            }

            // Test de la projection LEFT.
            // On calcul le delta de deplacement de la bordure.
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection LEFT.
            if (ref === 0 || ref === 3) {

              move = left.points[ref].x - delta;

              if (move > left.size_proj_mini.l - this.margin) {
                right.setOverlapping(true);
                // si la limite a été atteinte sur l'hypotenuse auparavant.
                if (test !== 0 && tmp_cos < 1){
                  test_tmp = Math.max(test, (left.points[1].x - (left.size_proj_mini.l - this.margin)) / cosinus);
                  // si la limite actuelle passe avant celle de l'hypothenuse.
                  if (test_tmp > test){
                    tmp_cos = 1;
                    test = left.points[1].x - (left.size_proj_mini.l - this.margin);
                  }
                }
                // Si pas de limite sur l'hypothenuse auparavant, test standard.
                else {
                  test = Math.max(test, left.points[1].x - (left.size_proj_mini.l - this.margin));
                }
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? left.points[1].x - value : value;
                  left.points[0].setX(v || m);
                  left.points[3].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection LEFT.
            else {

              move = left.points[ref].x - delta;

              if (move < left.size_proj_mini.r + this.margin) {
                right.setOverlapping(true);
                // si la limite a été atteinte sur l'hypotenuse auparavant.
                if (test !== 0 && tmp_cos < 1){
                  test_tmp = Math.max(test, ((left.size_proj_mini.r + this.margin) - left.points[0].x) / cosinus);
                  // si la limite actuelle passe avant celle de l'hypothenuse.
                  if (test_tmp > test){
                    tmp_cos = 1;
                    test = (left.size_proj_mini.r + this.margin) - left.points[0].x;
                  }
                }
                // Si pas de limite sur l'hypothenuse auparavant, test standard.
                else {
                  test = Math.max(test, (left.size_proj_mini.r + this.margin) - left.points[0].x);
                }
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? left.points[0].x + value : value;
                  left.points[1].setX(v || m);
                  left.points[2].setX(v || m);
                }
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(var i in execute){
                execute[i](test);
              }
              return test * cosinus;
            }
            else {
              for(var i in execute){
                execute[i]();
              }
              right.setOverlapping(false);
              return false;
            }

          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      }

      /**
       * Redimensionne les projections si le nouvel effet pousse la projection active.
       *
       * @param state
       * @param entity
       */
      checkBorderBoite(state, entity){

        var posExt = entity.findExtreme(),
            boite = this.projections[state],
            posExtBoite = boite.findExtreme(),
            position = {};

        // L'obj est à gauche de la boite
        if (posExt.l < (posExtBoite.l + boite.margin)){
          position.x = posExt.l - boite.margin;
          this.projectionsCollisionX(state, position, 0);
          boite.points[0].setX(posExt.l - boite.margin);
          boite.points[3].setX(posExt.l - boite.margin);
        }
        // L'obj est à haut de la boite
        if (posExt.t < (posExtBoite.t + boite.margin)){
          position.y = posExt.t - boite.margin;
          this.projectionsCollisionY(state, position, 0);
          boite.points[0].setY(posExt.t - boite.margin);
          boite.points[1].setY(posExt.t - boite.margin);
        }
        // L'obj est à droite de la boite
        if (posExt.r > (posExtBoite.r - boite.margin)){
          position.x = posExt.r + boite.margin;
          this.projectionsCollisionX(state, position, 1);
          boite.points[1].setX(posExt.r + boite.margin);
          boite.points[2].setX(posExt.r + boite.margin);
        }
        // L'obj est en bas de la boite
        if (posExt.b > (posExtBoite.b - boite.margin)){
          position.y = posExt.b + boite.margin;
          this.projectionsCollisionY(state, position, 3);
          boite.points[2].setY(posExt.b + boite.margin);
          boite.points[3].setY(posExt.b + boite.margin);
        }
      }

      createProjectionsLimits(state){

        // On détermine le cosinus de la pente de la boite.
        //var cosinus = this.size.h / this.size.d;
        //
        //function compare(forW, forH, proj_limit, size, forHypo, forAdj){
        //  size[forW] = Math.max(size[forW], proj_limit.size.w);
        //  size[forH] = Math.max(size[forH], proj_limit.size.h);
        //  if (forHypo){
        //    size.d = Math.max(size.d, proj_limit.size[forHypo]/cosinus);
        //  }
        //  if (forAdj){
        //    size.h = Math.max(size.h, proj_limit.size.h*cosinus);
        //  }
        //}

        // Definition des tailles limites minimales.
        var limit_up, limit_down, limit_left, limit_right, limit_top, limit_bottom, size_proj_mini = {};

        limit_up = this.projections.up.findAllExtreme();
        limit_down = this.projections.down.findAllExtreme();
        limit_left = this.projections.left.findAllExtreme();
        limit_right = this.projections.right.findAllExtreme();
        limit_top = this.projections.top.findAllExtreme();
        limit_bottom = this.projections.bottom.findAllExtreme();

        this.projections.top.size_proj_mini = limit_top;
        this.projections.bottom.size_proj_mini = limit_bottom;
        this.projections.up.size_proj_mini = limit_up;
        this.projections.down.size_proj_mini = limit_down;
        this.projections.left.size_proj_mini = limit_left;
        this.projections.right.size_proj_mini = limit_right;

        //var size_mini = {
        //  w: 0,
        //  h: 0,
        //  d: 0,
        //  d1: this.initialHeight,
        //  d2: this.initialHeight
        //};
        //
        //compare('w', 'd', limit_up, size_mini, false, true);
        //compare('w', 'h', limit_down, size_mini, 'h', false);
        //compare('h', 'd1', limit_left, size_mini, 'w', false);
        //compare('h', 'd1', limit_right, size_mini, 'w', false);
        //compare('w', 'd2', limit_top, size_mini, false, false);
        //compare('w', 'd1', limit_bottom, size_mini, false, false);
        //
        //
        //this.projections.top.size_proj_mini = {
        //  w: size_mini.w,
        //  h: size_mini.d2
        //};
        //
        //this.projections.bottom.size_proj_mini = {
        //  w: size_mini.w,
        //  h: size_mini.d1
        //};
        //
        //this.projections.up.size_proj_mini = {
        //  w: size_mini.w,
        //  h: size_mini.d
        //};
        //
        //this.projections.down.size_proj_mini = {
        //  hypo: size_mini.d,
        //  w: size_mini.w,
        //  h: size_mini.h
        //};
        //
        //this.projections.left.size_proj_mini = {
        //  hypo: size_mini.d,
        //  w: size_mini.h,
        //  h: Math.max(size_mini.d1, size_mini.d2)
        //};
        //
        //this.projections.right.size_proj_mini = {
        //  hypo: size_mini.d,
        //  w: size_mini.h,
        //  h: Math.max(size_mini.d1, size_mini.d2)
        //};
        //
        //return size_mini;
      }

      createProjectionsCoords(state) {
        // Création des coordonnées de point des projections.
        // A partir des dimensions de la MasterBoite.
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
      updateAllProjections(state){
        this.updateMaster(state);
        this.updateProjection('top');
        this.updateProjection('bottom');
        this.updateProjection('left');
        this.updateProjection('right');
        this.updateProjection('up');
        this.updateProjection('down');
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
        this.textDeco = [];
        this.shapeDeco = [];
        this.imgDeco = [];
        
        this.shapeObject = 'Rect';
        this.fonction = 'Boite';
        
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
        text = this.textDeco;
        shape = this.shapeDeco;
        img = this.imgDeco;

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

      /**
       * Retourne les la position extreme selon tous les éléments présents sur le facette de la boite.
       * Permet d'en déduire les tailles minimales des boites.
       *
       * @returns {{t: Number, r: number, b: number, l: Number}}
       */
      findAllExtreme(){
        var i, j, m, l, posExtreme = {}, saveExtreme;

        posExtreme = {t:Infinity,r:-Infinity,b:-Infinity,l:Infinity};

        saveExtreme = function(posExtreme, pos){
          posExtreme.t = Math.min(posExtreme.t, pos.y);
          posExtreme.r = Math.max(posExtreme.r, pos.x);
          posExtreme.b = Math.max(posExtreme.b, pos.y);
          posExtreme.l = Math.min(posExtreme.l, pos.x);
        };

        l = this.effets.length;
        if (l){
          for (i = 0; i < l; i++){
            for (j = 0, m = this.effets[i].points.length; j < m; j++){
              saveExtreme(posExtreme, this.effets[i].points[j]);
            }
          }
        }
        l = this.composants.length;
        if (l){
          for (i = 0; i < l; i++){
            for (j = 0, m = this.composants[i].points.length; j < m; j++){
              saveExtreme(posExtreme, this.composants[i].points[j]);
            }
          }
        }

        posExtreme.size = {w: posExtreme.r - posExtreme.l, h: posExtreme.b - posExtreme.t};

        return posExtreme;
      }

      /**
       * Retourne les dimensions extremes de la boite.
       * @returns {{t: Number, r: number, b: number, l: Number}}
       */
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


      ///**
      // * Redimensionne la boite si le nouvel effet est en dehors.
      // */
      //checkBorderBoite(entity){
      //  var posExt = entity.findExtreme();
      //  var posExtBoite = this.findExtreme();
      //
      //  // L'obj est à gauche de la boite
      //  if (posExt.l < (posExtBoite.l + this.margin)){
      //    this.points[0].setX(posExt.l - this.margin);
      //    this.points[3].setX(posExt.l - this.margin);
      //  }
      //  // L'obj est à haut de la boite
      //  if (posExt.t < (posExtBoite.t + this.margin)){
      //    this.points[0].setY(posExt.t - this.margin);
      //    this.points[1].setY(posExt.t - this.margin);
      //  }
      //  // L'obj est à droite de la boite
      //  if (posExt.r > (posExtBoite.r - this.margin)){
      //    this.points[1].setX(posExt.r + this.margin);
      //    this.points[2].setX(posExt.r + this.margin);
      //  }
      //  // L'obj est en bas de la boite
      //  if (posExt.b > (posExtBoite.b - this.margin)){
      //    this.points[2].setY(posExt.b + this.margin);
      //    this.points[3].setY(posExt.b + this.margin);
      //  }
      //}

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
      drawCanvasLimits(ctx){
        if(this.size_proj_mini.size.w > 0) {
          ctx.beginPath();
          ctx.rect(this.size_proj_mini.l, this.size_proj_mini.t, this.size_proj_mini.size.w, this.size_proj_mini.size.h);
          ctx.closePath();
          ctx.stroke();
        }
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
        this.margin = 5;
        this.color = obj.color || 'black';
        this.input = obj.input || 'input';
        // fillText, strokeText
        this.type = obj.type || 'fillText';
        this.size = {};
        this.text_size = {};
        //this.textAlign = obj.textAlign || 'left';

        // Angle de rotation
        this.shapeObject = 'Rect';
        this.fonction = 'deco';
        this.angle = obj.angle || 0;

        this.createPoints(ctx);
      }

      getSize(ctx, value){
        var size;
        var val = value || {};
        var text = val.texte || this.input;
        var fontSize = val.size || this.font.size;

        var fontSettings =
            this.font.style + ' '
            + this.font.variant + ' '
            + this.font.weight + ' '
            + fontSize + 'px' + ' '
            + this.font.family;

        ctx.save();
        //ctx.font =
        //  this.font.style + ' '
        //  + this.font.variant + ' '
        //  + this.font.weight + ' '
        //  + fontSize + 'px' + ' '
        //  + this.font.family;
        ctx.font = fontSettings;

        size = {
          w: ctx.measureText(text).width,
          h: parseInt(fontSize)
        };

        this.text_size = size;

        ctx.restore();

        return size;
      }

      createPoints(ctx){
        var mar, w, h;
        var size = this.getSize(ctx);
        mar = this.margin;
        w = size.w;
        h = size.h;

        this.points = [
          new Point({x: 0, y: 0}),
          new Point({x: w + mar*2, y: 0}),
          new Point({x: w + mar*2, y: h + mar*2}),
          new Point({x: 0, y: h + mar*2})
        ];
      }

      actualisePoints(ctx, value){
        var mar, vectors, w, h, ow, oh, deltaW, deltaH, oC, C, l;
        // On récupere les anciennes dimensions.
        mar = this.margin;
        ow = this.text_size.w;
        oh = this.text_size.h;

        this.getSize(ctx, value);

        w = this.text_size.w;
        h = this.text_size.h;

        // On calcule la variation de taille.
        deltaW = (w - ow) / 2;
        deltaH = (h - oh) / 2;

        // On prend en compte la marge.
        if (deltaW || deltaH) {
          // On récupère le barycentre.
          C = this.getCenter();
          l = this.points.length;
          // On construit les vecteurs de transformation.
          vectors = [
            new Point({x: -deltaW, y: -deltaH}),
            new Point({x: deltaW, y: -deltaH}),
            new Point({x: deltaW, y: deltaH}),
            new Point({x: -deltaW, y: deltaH})
          ];

          // On applique la transformation.
          for (var i = 0; i < l; i++) {
            this.points[i].rotate(-this.angle, C);
            this.points[i].translate(vectors[i]);
            this.points[i].rotate(this.angle, C);
          }
        }
      }


      actualiseFont(){

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
        var posExtreme = {t:Infinity,r: Number.NEGATIVE_INFINITY,b:Number.NEGATIVE_INFINITY,l:Infinity};

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

        this.size.w = posExtreme.size.w;
        this.size.h = posExtreme.size.h;

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

        this.angle += angle;
      }

      drawHandler(ctx){

        var i, j, l = this.points.length;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (i = 0; i < l; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = 'white';
        for (j = 0; j < l; j++) {
          ctx.beginPath();
          ctx.arc(this.points[j].x, this.points[j].y, 5, 0, 2 * Math.PI, false);
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
        }
        ctx.restore();
      }

      drawCanvas(ctx){
        ctx.save();
        ctx.font =
          this.font.style + ' '
          + this.font.variant + ' '
          + this.font.weight + ' '
          + this.font.size + 'px' + ' '
          + this.font.family;

        ctx.fillStyle = this.font.color;
        ctx.textBaseline = this.font.baseline;

        ctx.textAlign = 'center';
        var center = this.getCenter();
        ctx.translate(center.x, center.y);
        ctx.rotate(-this.angle * (2*Math.PI)/360.0);

        switch(this.type) {
          case 'fillText':
          default:
            ctx.fillText(this.input, 0, 0);
            break;
          case 'strokeText':
            ctx.strokeText(this.input, 0, 0);
            break;
        }
       // ctx.setTransform(1, 0, 0, 1, 0, 0);
       // ctx.translate(-center.x, -center.y);
        ctx.restore();

        if (this.isSelected) {
          this.drawHandler(ctx);
        }

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
            console.log(loc + '--> terme non reconnu par le constructeur ArrowPoint');
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
