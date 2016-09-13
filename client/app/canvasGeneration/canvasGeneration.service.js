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
        var alphaRad = angle * (2*Math.PI)/360.0;
        var cos = Math.cos(alphaRad);
        var sin = Math.sin(alphaRad);
        var posC = {};

        // Calcul des coordonné du point dans le repère du baricentre C.
        posC.x = this.getX() - C.x;
        posC.y = this.getY() - C.y;

        // Calcul des coordonnées du point après rotation dans le repère d'origine.
        this.setX(posC.x * cos + posC.y * sin + C.x);
        this.setY(- posC.x * sin + posC.y * cos + C.y);
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
        this.titreOption = entity.titreOption || null;
        this.titreParentEffet = entity.titreParentEffet || null;
        this.titreParentOption = entity.titreParentOption || null;
        this.description = entity.description || null;
        this.descriptionOption = entity.descriptionOption || null;
        this.composants = [];
        this.itemInfo = entity.itemInfo || null;
        this.prix = entity.prix || null;
        
        this.isSelected = false;
        this.isOverlapping = false;
        this.inCanvas = entity.inCanvas || false;

        this.fonction = entity.fonction || 'Effet';
        this.angle = entity.angle || 0;
        this.size = entity.size || {};
        this.posBox = {};
        
        this.points = entity.points;
        this.pointsDefault = entity.pointsDefault || null;
        this.initPoints(entity.points, this.points);
        this.initPoints(entity.pointsDefault, this.pointsDefault);
        this.posBox = this.points[0];
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
              compos[i].points[j].x = this.points[0].x + compos[i].pointsDefault[j].x ;
              compos[i].points[j].y = this.points[0].y + compos[i].pointsDefault[j].y ;
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
        };
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

      /**
       * Retourne des coordonnées pour positionner une box-dessin.
       * @returns {{x: number, y: number}}
       */
      getBoxPos(){
        var c = this.getCenter();
        var e = this.findExtreme();

        return {
          x: c.x - e.size.w / 2,
          y: c.y - e.size.h / 2
        };
      }

      /**
       * Retourne les dimensions de l'objet sur le canvas.
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
        var oldP0 = new Point(this.points[0]);

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
                this.composants[i].pointsDefault[j].setX(this.composants[i].points[j].getX() - this.points[0].getX());
                this.composants[i].pointsDefault[j].setY(this.composants[i].points[j].getY() - this.points[0].getY());
              }
            }
          }
          // Si debrayable doit appliquer un rotation au composant qui serait virtuellement dans cette
          // position si cela n'avait pas été débrayable afin de remettre le composant à la bonne place
          // si l'utilisateur switch de debrayable à non.
          else {
            for (i = 0, l = this.composants.length; i < l; i++) {
              for (j = 0, l2 = this.composants[i].points.length; j < l2; j++) {

                point = new Point(this.composants[i].pointsDefault[j]);

                // Coordonnée du pt dans le ref du barycentre OK.
                point.setX(point.getX() + oldP0.getX() - C.x);
                point.setY(point.getY() + oldP0.getY() - C.y);

                // Rotation du pt par rapport au bary dans le repère du bary.
                point.rotate(angle, {x:0,y:0});

                // Coordonné du pt par rapport à p0 de l'effet deja rotate.
                point.setX(C.x + point.getX() - this.points[0].getX());
                point.setY(C.y + point.getY() - this.points[0].getY());

                // Affectation.
                this.composants[i].pointsDefault[j].setX(point.getX());
                this.composants[i].pointsDefault[j].setY(point.getY());
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
        if (this.shapeObject === 'Rect' || this.shapeObject === 'Poly'){
          if (this.angle%90 === 0) {
            this.shapeObject = 'Rect';
          }
          else {
            this.shapeObject = 'Poly';
          }
        }
      }

      moveCloseBorder(canvas, marginCanvas, marginAdd) {

        marginAdd = marginAdd || 0;
        marginCanvas += marginAdd;

        var vector = {
          x: 0,
          y: 0
        };

        // Regarde si la figure sort du canvas.
        var maxPos = this.findExtreme();

        // Debordement par le haut.
        if (maxPos.t < marginCanvas) {
          this.move({x:0, y: marginCanvas - maxPos.t});
          vector.y = marginCanvas - maxPos.t;
        }
        // Debordement par la gauche.
        if (maxPos.l < marginCanvas) {
          this.move({x:marginCanvas - maxPos.l, y:0});
          vector.x = marginCanvas - maxPos.l;
        }
        // Debordement par la droite.
        if (maxPos.r + marginCanvas + 150 > canvas.width) {
          canvas.width = maxPos.r + marginCanvas + 150;
        }
        // Debordement par le bas.
        if (maxPos.b + marginCanvas + 150 > canvas.height) {
          canvas.height = maxPos.b + marginCanvas + 150;
        }
        return vector;
      }
    }


    class Cercle extends Shape {
      constructor(entity) {
        super(entity);
        this.shapeObject = 'Cercle';
      }

      getRadius() {
        return Math.sqrt(
            (this.points[0].x - this.points[1].x) * (this.points[0].x - this.points[1].x) +
            (this.points[0].y - this.points[1].y) * (this.points[0].y - this.points[1].y)) / 2;
      }

      drawCanvas(ctx) {
        ctx.beginPath();
        ctx.arc(this.getCenterX(), this.getCenterY(), this.getRadius(), 0, 2*Math.PI);

        // Draw center.
        ctx.fillRect(this.getCenterX(),this.getCenterY(),1,1);

        if (this.isOverlapping) {
          ctx.fillStyle = 'rgba(255, 00, 00, 0.2)';
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
          ctx.fillStyle = 'rgba(255, 00, 00, 0.2)';
          ctx.fill();
        }
      }
    }

    /**
     * Constructeur de la classe Boite.
     *
     * Une instance de Boite correspond à l'une des 6 vues du canvas.
     * Chaque instance de Boite est passée en propriété de masterBoite.projections :
     *
     *    -> VUE DESSUS  - viewState 'up':
     *       masterBoite.projections.up
     *    -> VUE DESSOUS  - viewState 'down':
     *       masterBoite.projections.down
     *    -> VUE COTE GAUCHE  - viewState 'left':
     *       masterBoite.projections.left
     *    -> VUE COTE DROIT  - viewState 'right':
     *       masterBoite.projections.right
     *    -> VUE COTE AVANT  - viewState 'bottom':
     *       masterBoite.projections.bottom
     *    -> VUE COTE ARRIERE  - viewState 'top':
     *       masterBoite.projections.top
     */
    class Boite {
      constructor (masterBoite, projPoints) {

        this.margin = masterBoite.margin;
        this.isSelected = false;
        this.isOverlapping = false;
        this.titre = 'Boite';
        this.effets = [];
        this.composants = [];

        this.textDeco = [];
        this.shapeDeco = [];
        this.imgDeco = [];

        this.shapeObject = 'Rect';
        this.fonction = 'Boite';
        this.color = 'grey';

        this.points = [];
        this.initPoints(projPoints.points, this.points);
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

      /**
       * Centre la boite et les élements dans le canvas.
       * vérifie si les marges de canvas ne sont pas atteintes.
       * Si margin du canvas atteintes, la boite et les élements sont bougés.
       * @param canvasGobal : object canvasGobal de canvasControl.
       */
      moveToCenterWindow(canvasGlobal){
        var vect;
        var centerW = {x:Number(canvasGlobal.canvas.canvasWindow.style.width.slice(0,-2))/2, y:Number(canvasGlobal.canvas.canvasWindow.style.height.slice(0,-2))/2};
        var center = this.getCenter();

        var vector = {
          x: centerW.x - center.x,
          y: centerW.y - center.y
        };

        this.move(vector);
        vect = this.moveCloseBorder(canvasGlobal.canvas.canvas, canvasGlobal.canvas.marginCanvas);

        vector.x += vect.x;
        vector.y += vect.y;

        this.moveEffetCompo(vector);

        // Reinitialise l'ascenceur dans la div contenant le canvas.
        canvasGlobal.canvas.canvasWindow.scrollTop = 0;
        canvasGlobal.canvas.canvasWindow.scrollLeft = 0;
      }

      /**
       * Bouge les éléemnts de la boite selon le vecteur passé en argument.
       * @param delta
       */
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
        var i, j, m, l, posExtreme, saveExtreme;

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
        };
      }
      getCenterX(){
        return this.getCenter().x;
      }
      getCenterY(){
        return this.getCenter().y;
      }

      moveCloseBorder(canvas, marginCanvas, marginAdd) {

        marginAdd = marginAdd || 0;
        marginCanvas += marginAdd;

        var vector = {
          x: 0,
          y: 0
        };

        // Regarde si la figure sort du canvas.
        var maxPos = this.findExtreme();

        // Debordement par le haut.
        if (maxPos.t < marginCanvas) {
          this.move({x:0, y: marginCanvas - maxPos.t});
          vector.y = marginCanvas - maxPos.t;
        }
        // Debordement par la gauche.
        if (maxPos.l < marginCanvas) {
          this.move({x:marginCanvas - maxPos.l, y:0});
          vector.x = marginCanvas - maxPos.l;
        }
        // Debordement par la droite.
        if (maxPos.r + marginCanvas + 150 > canvas.width) {
          canvas.width = maxPos.r + marginCanvas + 150;
        }
        // Debordement par le bas.
        if (maxPos.b + marginCanvas + 150 > canvas.height) {
          canvas.height = maxPos.b + marginCanvas + 150;
        }
        return vector;
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
        if(this.sizeProjMini.size.w > 0) {
          ctx.beginPath();
          ctx.rect(this.sizeProjMini.l, this.sizeProjMini.t, this.sizeProjMini.size.w, this.sizeProjMini.size.h);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    /**
     * Constructeur de la classe MasterBoite.
     *
     * La propriété 'projections' détient 6 proriétés, une pour chaque 'vue' du canvas.
     * Chaqune des propriétés correspondates fait référence à une instance de l'objet 'Boite'.
     *
     *    -> VUE DESSUS  - viewState 'up':
     *       masterBoite.projections.up
     *    -> VUE DESSOUS  - viewState 'down':
     *       masterBoite.projections.down
     *    -> VUE COTE GAUCHE  - viewState 'left':
     *       masterBoite.projections.left
     *    -> VUE COTE DROIT  - viewState 'right':
     *       masterBoite.projections.right
     *    -> VUE COTE AVANT  - viewState 'bottom':
     *       masterBoite.projections.bottom
     *    -> VUE COTE ARRIERE  - viewState 'top':
     *       masterBoite.projections.top
     *
     */
    class MasterBoite {
      constructor(entity) {
        this.margin = entity.margin || this.convertMargin(5);
        this.initialHeight = entity.initialHeight || this.convertInitialHeight(80);

        if (entity.fonction === 'MasterBoite') {
          this.size = entity.size;
        }
        else {
          this.size = {
            w: null,
            h: null,
            d: null,
            d1: this.initialHeight,
            d2: this.initialHeight
          };
          this.initBoiteWithEffect(entity)
        }

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

      convertMargin(value) {
        return this.margin = canvasConversion.convertToPixel(value);
      }

      convertInitialHeight(value) {
        return this.initialHeight = canvasConversion.convertToPixel(value);
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
       * @returns {false || Number} si collision detectée, retourne une distance limite relative au point d'impact.
       */
      projectionsCollisionY(state, mousePos, index){

        var delta, up, left, right, top, bottom, ref, move, func, i, hypo, oldHypo, adj, oldAdj, height, cosinus;
        var opp = (this.size.d2 - this.size.d1);
        var testTmp = 0;

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

            cosinus = (left.points[1].x - left.points[0].x)  / ((up.points[3].y - up.points[0].y) - (mousePos.y - up.points[index].y));
            delta = (mousePos.y - up.points[index].y) * cosinus;
            ref = ((index - 1) >= 0) ? index - 1 : 3;

            // Si deplacement bord gauche de la projection LEFT.
            if (ref === 0 || ref === 3) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = left.points[ref].x + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > left.sizeProjMini.l - this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, left.points[1].x - (left.sizeProjMini.l - this.margin));
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
                };
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord droit de la projection LEFT.
            else {

              move = left.points[ref].x + delta;

              if (move < left.sizeProjMini.r + this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, (left.sizeProjMini.r + this.margin) - left.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? left.points[0].x + value : value;
                  left.points[1].setX(v || m);
                  left.points[2].setX(v || m);
                };
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
              if (move > right.sizeProjMini.l - this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, right.points[1].x - (right.sizeProjMini.l - this.margin));
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
                };
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord droit de la projection RIGHT.
            else {

              move = right.points[ref].x - delta;

              if (move < right.sizeProjMini.r + this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, (right.sizeProjMini.r + this.margin) - right.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? right.points[0].x + value : value;
                  right.points[1].setX(v || m);
                  right.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(i in execute){
                execute[i](test);
              }
              return getTriangleHypo(test, opp);
            }
            else {
              for(i in execute){
                execute[i]();
              }
              up.setOverlapping(false);
              return false;
            }
            break;

          case 'left':

            oldAdj = left.points[1].y - left.points[0].y;
            adj = oldAdj - (mousePos.y - left.points[index].y);
            opp = left.points[2].x - left.points[3].x;
            oldHypo = getTriangleHypo(oldAdj, opp);
            hypo = getTriangleHypo(adj, opp);
            height = left.points[2].y - left.points[1].y;


            // Test de la projection UP.
            // test uniquement sur le bord haut de la projection UP.
            delta = oldHypo - hypo;

            ref = index;

            if (ref === 0 || ref === 1) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = up.points[ref].y + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > up.sizeProjMini.t - this.margin) {
                left.setOverlapping(true);
                test = up.points[3].y - (up.sizeProjMini.t - this.margin);
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? up.points[3].y - value : value;
                  up.points[0].setY(v || m);
                  up.points[1].setY(v || m);
                };
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Test de la projection TOP
            // Si deplacement bord haut de la projection TOP.
            delta = mousePos.y - left.points[index].y;

            if (ref === 0 || ref === 1) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = top.points[ref].y + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > top.sizeProjMini.t - this.margin) {
                left.setOverlapping(true);
                // On cherche l'équivalent hypothénuse sur up de la limite sur top.
                adj = (top.points[3].y - (top.sizeProjMini.t - this.margin)) - height;
                hypo = getTriangleHypo(adj, opp);
                test = Math.max(test, hypo);
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? top.points[3].y - (getTriangleSide(value, opp) + height) : value;
                  top.points[0].setY(v || m);
                  top.points[1].setY(v || m);
                };
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord bas de la projection TOP.
            else {

              move = top.points[ref].y + delta;

              if (move < top.sizeProjMini.b + this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, (top.sizeProjMini.b + this.margin) - top.points[0].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[0].y + value : value;
                  top.points[2].setY(v || m);
                  top.points[3].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection BOTTOM
            // Si deplacement bord bas de la projection BOTTOM.
            if (ref === 2 || ref === 3) {

              move = bottom.points[ref].y + delta;

              if (move < bottom.sizeProjMini.b + this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, ((bottom.sizeProjMini.b + this.margin) - bottom.points[0].y) + oldAdj);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[0].y + (value - oldAdj) : value;
                  bottom.points[2].setY(v || m);
                  bottom.points[3].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection RIGHT
            // Si deplacement sommet droit de la projection RIGHT.
            // Pas besoin de test collision.
            // On coordonne uniquement le déplacement du sommet.
            if (ref === 0){
              move = right.points[1].y + delta;
              func = function(){
                var m = move;
                return function(value){
                  var v = value ? right.points[2].y - (getTriangleSide(value, opp) + height) : value;
                  right.points[1].setY(v || m);
                };
              };

              execute.push(func());
            }


            // Si deplacement bord bas de la projection RIGHT.
            if (ref === 2 || ref === 3) {

              move = right.points[ref].y + delta;

              if (move < right.sizeProjMini.b + this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, (right.sizeProjMini.b + this.margin) - right.points[1].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? right.points[1].y + value : value;
                  right.points[2].setY(v || m);
                  right.points[3].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            // Si mouvement côté haut sur Left.
            if( testTmp === 1 ) {
              if (test !== 0) {
                for (i in execute) {
                  execute[i](test);
                }
                return getTriangleSide(test, opp) + height;
              }
              else {
                for (i in execute) {
                  execute[i]();
                }
                left.setOverlapping(false);
                return false;
              }
            }
          // Si mouvement côté bas sur Left.
            else {
              if (test !== 0) {
                for (i in execute) {
                  execute[i](test);
                }
                return test;
              }
              else {
                for (i in execute) {
                  execute[i]();
                }
                left.setOverlapping(false);
                return false;
              }
            }
            break;

          case 'right':

            oldAdj = right.points[0].y - right.points[1].y;
            adj = oldAdj - (mousePos.y - right.points[index].y);
            opp = right.points[2].x - right.points[3].x;
            oldHypo = getTriangleHypo(oldAdj, opp);
            hypo = getTriangleHypo(adj, opp);
            height = right.points[3].y - right.points[0].y;

            // Test de la projection UP.
            // test uniquement sur le bord haut de la projection UP.
            delta = oldHypo - hypo;

            ref = index;

            if (ref === 0 || ref === 1) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = up.points[ref].y + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > up.sizeProjMini.t - this.margin) {
                right.setOverlapping(true);
                //test = Math.max(test, up.points[3].y - (up.sizeProjMini.t - this.margin));
                test = up.points[3].y - (up.sizeProjMini.t - this.margin);
                testTmp = 1;
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? up.points[3].y - value : value;
                  up.points[0].setY(v || m);
                  up.points[1].setY(v || m);
                };
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }



            // Test de la projection TOP
            delta = mousePos.y - right.points[index].y;
            ref = index;

            // Si deplacement bord haut de la projection TOP.
            if (ref === 0 || ref === 1) {

              // On détermine le delta de mouvement à partir de la projection active.
              move = top.points[ref].y + delta;

              // On verifie si une limite est atteinte sur la projection testée.
              // Si limite atteinte, on cherche l'épaisseur de la projection.
              if (move > top.sizeProjMini.t - this.margin) {
                right.setOverlapping(true);
                adj = (top.points[3].y - (top.sizeProjMini.t - this.margin)) - height;
                hypo = getTriangleHypo(adj, opp);
                test = Math.max(test, hypo);
                testTmp = 1;
              }

              // On construit la fonction qui sera exécutée en fin de block.
              func = function(){
                var m = move;
                return function(value){
                  // Si value = undefined : la projection est agrandie de la valeur delta 'm'.
                  // Si value définie : la projection est agrandie en fonction de l'épaisseur passée en argument.
                  var v = value ? top.points[3].y - (getTriangleSide(value, opp) + height) : value;
                  top.points[0].setY(v || m);
                  top.points[1].setY(v || m);
                };
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord bas de la projection TOP.
            else {

              move = top.points[ref].y + delta;

              if (move < top.sizeProjMini.b + this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, (top.sizeProjMini.b + this.margin) - top.points[0].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[0].y + value : value;
                  top.points[2].setY(v || m);
                  top.points[3].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection BOTTOM
            // Si deplacement bord bas de la projection BOTTOM.
            if (ref === 2 || ref === 3) {

              move = bottom.points[ref].y + delta;

              if (move < bottom.sizeProjMini.b + this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, ((bottom.sizeProjMini.b + this.margin) - bottom.points[0].y) + oldAdj);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[0].y + (value - oldAdj) : value;
                  bottom.points[2].setY(v || m);
                  bottom.points[3].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection LEFT
            // Si deplacement sommet gauche de la projection LEFT.
            // Pas besoin de test collision.
            // On coordonne uniquement le déplacement du sommet.
            if (ref === 1){
              move = left.points[0].y + delta;
              func = function(){
                var m = move;
                return function(value){
                  var v = value ? left.points[3].y - (getTriangleSide(value, opp) + height) : value;
                  left.points[0].setY(v || m);
                };
              };

              execute.push(func());
            }
            // Si deplacement bord bas de la projection LEFT.
            if (ref === 2 || ref === 3) {

              move = left.points[ref].y + delta;

              if (move < left.sizeProjMini.b + this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, (left.sizeProjMini.b + this.margin) - left.points[0].y);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? left.points[0].y + value : value;
                  left.points[2].setY(v || m);
                  left.points[3].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            // Si mouvement côté haut sur Right.
            if( testTmp === 1 ) {
              if (test !== 0) {
                for (i in execute) {
                  execute[i](test);
                }
                return getTriangleSide(test, opp) + height;
              }
              else {
                for (i in execute) {
                  execute[i]();
                }
                right.setOverlapping(false);
                return false;
              }
            }
            // Si mouvement côté bas sur Right.
            else {
              if (test !== 0) {
                for (i in execute) {
                  execute[i](test);
                }
                return test;
              }
              else {
                for (i in execute) {
                  execute[i]();
                }
                right.setOverlapping(false);
                return false;
              }
            }
            break;

          case 'top':
            return console.log('WARNING : "' + state + '" viewState is not yet implemented in box collision');
          case 'bottom':
            return console.log('WARNING : "' + state + '" viewState is not yet implemented in box collision');
          default:
            return console.log('ERROR : ' + state + ' is not a valid state');
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

        var delta, up, left, right, top, bottom, ref, move, func, i, testTmp, oldAdj, adj, opp, oldHypo, hypo;
        var tmpCos = 1;

        var test = 0;
        var execute = [];

        var getTriangleSide = function(hypo, side){
          return Math.sqrt(hypo * hypo - side * side);
        };

        var getTriangleHypo = function(adj, opp){
          return Math.sqrt(adj * adj + opp * opp);
        };

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

              if (move > up.sizeProjMini.l - this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, up.points[1].x - (up.sizeProjMini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[1].x - value : value;
                  up.points[0].setX(v || m);
                  up.points[3].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection UP.
            else {

              move = up.points[ref].x - delta;

              if (move < up.sizeProjMini.r + this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, (up.sizeProjMini.r + this.margin) - up.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[0].x + value : value;
                  up.points[1].setX(v || m);
                  up.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection BOTTOM.
            // On calcul le delta de deplacement de la bordure.
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection BOTTOM.
            if (ref === 0 || ref === 3) {

              move = bottom.points[ref].x - delta;

              if (move > bottom.sizeProjMini.l - this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, bottom.points[1].x - (bottom.sizeProjMini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[1].x - value : value;
                  bottom.points[0].setX(v || m);
                  bottom.points[3].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection BOTTOM.
            else {

              move = bottom.points[ref].x - delta;

              if (move < bottom.sizeProjMini.r + this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, (bottom.sizeProjMini.r + this.margin) - bottom.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[0].x + value : value;
                  bottom.points[1].setX(v || m);
                  bottom.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(i in execute){
                execute[i](test);
              }
              return test;
            }
            else {
              for(i in execute){
                execute[i]();
              }
              top.setOverlapping(false);
              return false;
            }
            break;

          case 'bottom':
            // Test de la projection UP.
            // On calcul le delta de deplacement de la bordure.
            delta = mousePos.x - bottom.points[index].x;
            ref = index;

            // Si deplacement bord gauche de la projection UP.
            if (ref === 0 || ref === 3) {

              move = up.points[ref].x + delta;

              if (move > up.sizeProjMini.l - this.margin) {
                top.setOverlapping(true);
                test = Math.max(test, up.points[1].x - (up.sizeProjMini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[1].x - value : value;
                  up.points[0].setX(v || m);
                  up.points[3].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection UP.
            else {

              move = up.points[ref].x + delta;

              if (move < up.sizeProjMini.r + this.margin) {
                bottom.setOverlapping(true);
                test = Math.max(test, (up.sizeProjMini.r + this.margin) - up.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[0].x + value : value;
                  up.points[1].setX(v || m);
                  up.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection TOP.
            // On calcul le delta de deplacement de la bordure.
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection TOP.
            if (ref === 0 || ref === 3) {

              move = top.points[ref].x - delta;

              if (move > top.sizeProjMini.l - this.margin) {
                bottom.setOverlapping(true);
                test = Math.max(test, top.points[1].x - (top.sizeProjMini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[1].x - value : value;
                  top.points[0].setX(v || m);
                  top.points[3].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection TOP.
            else {

              move = top.points[ref].x - delta;

              if (move < top.sizeProjMini.r + this.margin) {
                bottom.setOverlapping(true);
                test = Math.max(test, (top.sizeProjMini.r + this.margin) - top.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[0].x + value : value;
                  top.points[1].setX(v || m);
                  top.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(i in execute){
                execute[i](test);
              }
              return test;
            }
            else {
              for(i in execute){
                execute[i]();
              }
              bottom.setOverlapping(false);
              return false;
            }
            break;

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
              if (move > top.sizeProjMini.l - this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, top.points[1].x - (top.sizeProjMini.l - this.margin));
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
                };
              };

              // La fonction anonyme retournée est chargée dans la table, prête à être exécutée.
              execute.push(func());
            }

            // Si deplacement bord droit de la projection TOP.
            else {

              move = top.points[ref].x - delta;

              if (move < top.sizeProjMini.r + this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, (top.sizeProjMini.r + this.margin) - top.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? top.points[0].x + value : value;
                  top.points[1].setX(v || m);
                  top.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection BOTTOM.
            // On calcul le delta de deplacement de la bordure.
            ref = index;

            // Si deplacement bord gauche de la projection BOTTOM.
            if (ref === 0 || ref === 3) {

              move = bottom.points[ref].x + delta;

              if (move > bottom.sizeProjMini.l - this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, bottom.points[1].x - (bottom.sizeProjMini.l - this.margin));
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[1].x - value : value;
                  bottom.points[0].setX(v || m);
                  bottom.points[3].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection BOTTOM.
            else {

              move = bottom.points[ref].x + delta;

              if (move < bottom.sizeProjMini.r + this.margin) {
                up.setOverlapping(true);
                test = Math.max(test, (bottom.sizeProjMini.r + this.margin) - bottom.points[0].x);
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? bottom.points[0].x + value : value;
                  bottom.points[1].setX(v || m);
                  bottom.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(i in execute){
                execute[i](test);
              }
              return test;
            }
            else {
              for(i in execute){
                execute[i]();
              }
              up.setOverlapping(false);
              return false;
            }
            break;

          case 'left':
            // Test de la projection UP.
            // On calcul le delta de deplacement de la bordure.

            oldAdj = left.points[1].x - left.points[0].x;
            adj = oldAdj - (mousePos.x - left.points[index].x);
            opp = left.points[1].y - left.points[0].y;
            oldHypo = getTriangleHypo(oldAdj, opp);
            hypo = getTriangleHypo(adj, opp);

            delta = oldHypo - hypo;
            ref = ((index + 1) <= 3) ? index + 1 : 0;

            // Si deplacement bord bas de la projection UP.
            if (ref === 3 || ref === 2) {

              move = up.points[ref].y + delta;

              if (move < up.sizeProjMini.b + this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, (up.sizeProjMini.b + this.margin) - up.points[0].y);
                tmpCos = getTriangleSide(test, opp) / test;
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[0].y + value : value;
                  up.points[2].setY(v || m);
                  up.points[3].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord haut de la projection UP.
            else {

              move = up.points[ref].y + delta;

              if (move > up.sizeProjMini.t - this.margin) {
                left.setOverlapping(true);
                test = Math.max(test, up.points[3].y - (up.sizeProjMini.t - this.margin));
                tmpCos = getTriangleSide(test, opp) / test;
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[3].y - value : value;
                  up.points[0].setY(v || m);
                  up.points[1].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection RIGHT
            // On calcul le delta de deplacement de la bordure.
            delta = (mousePos.x - left.points[index].x);
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection RIGHT.
            if (ref === 0 || ref === 3) {

              move = right.points[ref].x - delta;

              if (move > right.sizeProjMini.l - this.margin) {
                left.setOverlapping(true);
                testTmp = Math.max(test, getTriangleHypo(right.points[1].x - (right.sizeProjMini.l - this.margin), opp));
                if (testTmp > test) {
                  tmpCos = (right.points[1].x - (right.sizeProjMini.l - this.margin)) / testTmp;
                  test = testTmp;
                }
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? right.points[1].x - (value * tmpCos) : value;
                  right.points[0].setX(v || m);
                  right.points[3].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection RIGHT.
            else {

              move = right.points[ref].x - delta;

              if (move < right.sizeProjMini.r + this.margin) {
                left.setOverlapping(true);
                testTmp = Math.max(test, getTriangleHypo((right.sizeProjMini.r + this.margin) - right.points[0].x, opp));
                if (testTmp > test) {
                  tmpCos = ((right.sizeProjMini.r + this.margin) - right.points[0].x) / testTmp;
                  test = testTmp;
                }
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? right.points[0].x + (value * tmpCos) : value;
                  right.points[1].setX(v || m);
                  right.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(i in execute){
                execute[i](test);
              }
              return test * tmpCos;
            }
            else {
              for(i in execute){
                execute[i]();
              }
              left.setOverlapping(false);
              return false;
            }
            break;


          case 'right':
            // Test de la projection UP.
            // On calcul le delta de deplacement de la bordure.

            oldAdj = right.points[1].x - right.points[0].x;
            adj = oldAdj - (mousePos.x - right.points[index].x);
            opp = right.points[0].y - right.points[1].y;
            oldHypo = getTriangleHypo(oldAdj, opp);
            hypo = getTriangleHypo(adj, opp);

            delta = oldHypo - hypo;
            ref = ((index - 1) >= 0) ? index - 1 : 3;

            // Si deplacement bord bas de la projection UP.
            if (ref === 3 || ref === 2) {

              move = up.points[ref].y - delta;

              if (move < up.sizeProjMini.b + this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, (up.sizeProjMini.b + this.margin) - up.points[0].y);
                tmpCos = getTriangleSide(test, opp) / test;
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[0].y + value : value;
                  up.points[3].setY(v || m);
                  up.points[2].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord haut de la projection UP.
            else {

              move = up.points[ref].y - delta;

              if (move > up.sizeProjMini.t - this.margin) {
                right.setOverlapping(true);
                test = Math.max(test, up.points[3].y - (up.sizeProjMini.t - this.margin));
                tmpCos = getTriangleSide(test, opp) / test;
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? up.points[3].y - value : value;
                  up.points[0].setY(v || m);
                  up.points[1].setY(v || m);
                };
              };

              execute.push(func());
            }

            // Test de la projection LEFT.
            // On calcul le delta de deplacement de la bordure.
            delta = (mousePos.x - right.points[index].x);
            ref = ((index - 2) >= 0) ? index - 2 : index + 2;

            // Si deplacement bord gauche de la projection LEFT.
            if (ref === 0 || ref === 3) {

              move = left.points[ref].x - delta;

              if (move > left.sizeProjMini.l - this.margin) {
                right.setOverlapping(true);
                testTmp = Math.max(test, getTriangleHypo(left.points[1].x - (left.sizeProjMini.l - this.margin), opp));
                if (testTmp > test) {
                  tmpCos = (left.points[1].x - (left.sizeProjMini.l - this.margin)) / testTmp;
                  test = testTmp;
                }
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? left.points[1].x - (value * tmpCos) : value;
                  left.points[0].setX(v || m);
                  left.points[3].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Si deplacement bord droit de la projection LEFT.
            else {

              move = left.points[ref].x - delta;

              if (move < left.sizeProjMini.r + this.margin) {
                right.setOverlapping(true);
                testTmp = Math.max(test, getTriangleHypo((left.sizeProjMini.r + this.margin) - left.points[0].x, opp));
                if (testTmp > test) {
                  tmpCos = ((left.sizeProjMini.r + this.margin) - left.points[0].x) / testTmp;
                  test = testTmp;
                }
              }

              func = function(){
                var m = move;
                return function(value){
                  var v = value ? left.points[0].x + (value * tmpCos) : value;
                  left.points[1].setX(v || m);
                  left.points[2].setX(v || m);
                };
              };

              execute.push(func());
            }

            // Exécution des mouvements de projections.
            if (test !== 0){
              for(i in execute){
                execute[i](test);
              }
              return test * tmpCos;
            }
            else {
              for(i in execute){
                execute[i]();
              }
              right.setOverlapping(false);
              return false;
            }
            break;

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

        // L'obj est à haut de la boite.
        // Si vue gauche ou droite, on bloque l'élargissement du top.
        if (state === 'left' || state === 'right'){
          var b1 = boite.points[2].y - boite.points[1].y;
          var b2 = boite.points[3].y - boite.points[0].y;
          var center = entity.getCenter();
          // Si vue gauche, on bloque l'élément à la hauteur minimale d1.
          if (state === 'left') {
            posExtBoite.t =  posExtBoite.b - b1;
            if (posExt.t < (posExtBoite.t + boite.margin)) {
              entity.moveTo({x: center.x, y: posExtBoite.b - (b1 - (posExt.size.h / 2) - boite.margin)});
              posExt = entity.findExtreme();
            }
          }
          // Si vue droite, on bloque l'élément à la hauteur minimale d1.
          else {
            posExtBoite.t =  posExtBoite.b - b2;
            if (posExt.t < (posExtBoite.t + boite.margin)) {
              entity.moveTo({x: center.x, y: posExtBoite.b - (b2 - (posExt.size.h / 2) - boite.margin)});
              posExt = entity.findExtreme();
            }
          }
        }
        // Si autre vue, on élargit la boite normalement.
        else {
          if (posExt.t < (posExtBoite.t + boite.margin)) {
            position.y = posExt.t - boite.margin;
            this.projectionsCollisionY(state, position, 0);
            boite.points[0].setY(posExt.t - boite.margin);
            boite.points[1].setY(posExt.t - boite.margin);
          }
        }
        // L'obj est à gauche de la boite
        if (posExt.l < (posExtBoite.l + boite.margin)){
          position.x = posExt.l - boite.margin;
          this.projectionsCollisionX(state, position, 0);
          boite.points[0].setX(posExt.l - boite.margin);
          boite.points[3].setX(posExt.l - boite.margin);
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

        // Definition des tailles limites minimales.
        var limitUp, limitDown, limitLeft, limitRight, limitTop, limitBottom;

        limitUp = this.projections.up.findAllExtreme();
        limitDown = this.projections.down.findAllExtreme();
        limitLeft = this.projections.left.findAllExtreme();
        limitRight = this.projections.right.findAllExtreme();
        limitTop = this.projections.top.findAllExtreme();
        limitBottom = this.projections.bottom.findAllExtreme();

        this.projections.top.sizeProjMini = limitTop;
        this.projections.bottom.sizeProjMini = limitBottom;
        this.projections.up.sizeProjMini = limitUp;
        this.projections.down.sizeProjMini = limitDown;
        this.projections.left.sizeProjMini = limitLeft;
        this.projections.right.sizeProjMini = limitRight;

      }

      createProjectionsCoords(state) {
        // Création des coordonnées de point des projections.
        // A partir des dimensions de la MasterBoite.
        var projPoints = {
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
            return projPoints.top;
          case 'bottom':
            return projPoints.bottom;
          case 'up':
            return projPoints.up;
          case 'down':
            return projPoints.down;
          case 'left':
            return projPoints.left;
          case 'right':
            return projPoints.right;
          case 'all':
            return projPoints;
          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      }
      createProjection(projPoints) {
        projPoints = projPoints || this.createProjectionsCoords('all');
        this.projections.up = new Boite(this, projPoints.up);
        this.projections.down = new Boite(this, projPoints.down);
        this.projections.left = new Boite(this, projPoints.left);
        this.projections.right = new Boite(this, projPoints.right);
        this.projections.top = new Boite(this, projPoints.top);
        this.projections.bottom = new Boite(this, projPoints.bottom);
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
          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      }
    }

    class Texte {
      constructor(obj){

        if (typeof obj === 'string') {
          var str = obj;
          obj = {};
          obj.input = str;
        }
        obj.font = obj.font || {};
        
        // @todo a verifier si c vraiment un id unique.
        this._id = obj._id || Math.floor(Math.random() * (1e6 +1));
        this.key = 0;
        this.font = {
          // Font propiété dans canvas affect by ctx.font =
          style: obj.font.style || 'normal', // normal, italic, oblique.
          variant: obj.font.variant || 'normal', //normal, small-caps.
          weight: obj.font.weight || 'normal', // normal, bold, bolder, lighter, 100, 200 ... 900.
          size: obj.font.size || 50,
          family: obj.font.family || '"Lato", sans-serif, "google"',

          textAlign: 'center',
          baseline: 'middle', // top' || 'hanging' || 'middle' || 'alphabetic' || 'ideographic' || 'bottom',

          sizeAbs: obj.font.sizeAbs || 50,
          color: obj.font.color || 'black',
          type: obj.type || 'fillText', // fillText, strokeText
          isVertical: obj.vertical || false // ecrire vertical ou horizontal
        };

        this.input = obj.input || 'input';

        this.margin = obj.margin || 5;


        this.shapeObject = obj.shape || 'Rect';
        this.fonction = obj.fonction ||'Texte';
        this.angle = obj.angle || 0;

        this.sizeTxt = obj.sizeTxt || this.getSizeTxt();
        this.size = obj.size || {};

        this.points = obj.points || this.createPoints();
        this.initPoints(this.points, this.points);

        this.posBox = this.points[0];
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

      createPoints(){
        return [
          {x: 0, y: 0},
          {x: this.sizeTxt.w, y: 0},
          {x: this.sizeTxt.w, y: this.sizeTxt.h},
          {x: 0, y: this.sizeTxt.h}
        ];
      }


      fontSettings(){
        return this.font.style + ' ' +
               this.font.variant + ' ' +
               this.font.weight + ' ' +
               this.font.size + 'px' + ' ' +
               this.font.family;
      }

      getSizeTxt(){
        // Ceci crée un canvas virtuel qui va servir a calculer la taille.
        var canvasimg = document.createElement('canvas'),
          ctx = canvasimg.getContext('2d');
        
        ctx.font = this.fontSettings();

        if (!this.isVertical) {
          this.sizeTxt = {
            w: ctx.measureText(this.input).width + 2 * this.margin,
            h: +this.font.size + 2 * this.margin
          };
        } else {
          this.sizeTxt = {
            w: ctx.measureText('A').width + 2 * this.margin, // One random letter
            h: +this.font.size * this.input.length + 2 * this.margin
          };
        }
        return this.sizeTxt;
      }

      /**
       * Retourne des coordonnées pour positionner une box-dessin.
       * @returns {{x: number, y: number}}
       */
      getBoxPos(){
        var c = this.getCenter();
        var e = this.findExtreme();

        return {
          x: c.x - e.size.w / 2,
          y: c.y - e.size.h / 2
        };
      }

      actualisePoints(){
        var vectors, w, h, ow, oh, deltaW, deltaH, C;

        // On récupere les anciennes dimensions.
        ow = this.sizeTxt.w;
        oh = this.sizeTxt.h;

        // On récupère les nouvelles dimensions.
        this.getSizeTxt();
        w = this.sizeTxt.w;
        h = this.sizeTxt.h;

        // On calcule la variation de taille.
        deltaW = (w - ow) / 2;
        deltaH = (h - oh) / 2;

        // On prend en compte la marge.
        if (deltaW || deltaH) {

          // On construit les vecteurs de transformation.
          vectors = [
            new Point({x: -deltaW, y: -deltaH}),
            new Point({x: deltaW, y: -deltaH}),
            new Point({x: deltaW, y: deltaH}),
            new Point({x: -deltaW, y: deltaH})
          ];

          // On applique la transformation.
          C = this.getCenter();
          for (var i = 0, l = this.points.length; i < l; i++) {
            this.points[i].rotate(-this.angle, C);
            this.points[i].translate(vectors[i]);
            this.points[i].rotate(this.angle, C);
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
        };
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
       */
      rotate(angle, C){
        var i, l;

        // Barycentre.
        C = C || { x: this.getCenterX(), y: this.getCenterY()};

        // Tourne la forme
        for (i = 0, l = this.points.length; i < l; i++){
          this.points[i].rotate(angle, C);
        }

        this.changeShape();

        this.angle += angle;
      }

      changeShape(){
        // Change la forme de l'obj rectangle si pas // a l'axe.
        if (this.shapeObject === 'Rect' || this.shapeObject === 'Poly'){
          if (this.angle%90 === 0) {
            this.shapeObject = 'Rect';
          }
          else {
            this.shapeObject = 'Poly';
          }
        }
      }

      // Dessine la boite autour du texte.
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

      changeOrientation() {
        // Recalcule les points par rapport au barycentre.
        var center = this.getCenter();

        this.angle = 0;

        this.getSizeTxt();

        this.points = this.createPoints();
        this.moveTo(center);
      }

      drawCanvas(ctx){
        ctx.save();
        ctx.font = this.fontSettings();
        ctx.fillStyle = this.font.color;
        ctx.textBaseline = this.font.baseline;
        ctx.textAlign = this.font.textAlign;

        switch(this.type) {
          case 'fillText':
          default:
            var i, l, center;
            if (this.isVertical) {
              ctx.translate(this.points[0].x, this.points[0].y);
              ctx.rotate(-this.angle * (2*Math.PI)/360.0);
              ctx.translate(this.sizeTxt.w/2, this.font.size/2);
              for (i=0, l = this.input.length ; i < l ; i++) {
                ctx.fillText(this.input[i], 0, (i * this.font.size));
              }
            }
            else {
              center = this.getCenter();
              ctx.translate(center.x, center.y);
              ctx.rotate(-this.angle * (2*Math.PI)/360.0);
              ctx.fillText(this.input, 0, 0);
            }
            break;
          case 'strokeText':
            if (this.isVertical) {
              ctx.translate(this.points[0].x, this.points[0].y);
              ctx.rotate(-this.angle * (2*Math.PI)/360.0);
              ctx.translate(this.sizeTxt.w/2, this.font.size/2);
              for (i=0, l = this.input.length ; i < l ; i++) {
                ctx.strokeText(this.input[i], 0, (i * this.font.size));
              }
            }
            else {
              center = this.getCenter();
              ctx.translate(center.x, center.y);
              ctx.rotate(-this.angle * (2*Math.PI)/360.0);
              ctx.strokeText(this.input, 0, 0);
            }
            break;
        }
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

        this.loc = location || 'argument (location) missing';
        this.entity = entity;
        this.margin = 30;
        this.isSelected = false;
        this.setMethods(this.loc);
        this.setPos(this.loc);
        this.setTriangleDraw(this.loc);
        this.fonction = 'Arrow';

      }

      setMethods(loc){
        switch(loc) {
          case 'right':
            this.setValue = function(value){
              var posExtreme = this.entity.findExtreme();
              var newVal = canvasConversion.convertToPixel(value);
              this.entity.points[2].translate({x:0, y: newVal - posExtreme.size.h});
              this.entity.points[3].translate({x:0, y: newVal - posExtreme.size.h});
            };
            break;
          case 'bottom':
            this.setValue = function(value){
              var posExtreme = this.entity.findExtreme();
              var newVal = canvasConversion.convertToPixel(value);
              this.entity.points[1].translate({x:newVal - posExtreme.size.w, y: 0});
              this.entity.points[2].translate({x:newVal - posExtreme.size.w, y: 0});
            };
            break;
          default:
            console.log(loc + '--> terme non reconnu par le constructeur Arrow');
        }
      }

      setPos(loc){
        switch(loc) {
          case 'right':
            this.posStart = new Point({
              x: this.entity.points[1].x + this.margin,
              y: this.entity.points[1].y
            });
            this.posEnd = new Point({
              x: this.entity.points[2].x + this.margin,
              y: this.entity.points[2].y
            });
            this.posBox = new Point ({
              x: this.posStart.x + 10,
              y: this.posStart.y + (this.posEnd.y - this.posStart.y)/2
            });
            this.value = canvasConversion.convertToMm(this.entity.points[2].y - this.entity.points[1].y);
            break;
          case 'bottom':
            this.posStart = new Point({
              x: this.entity.points[3].x,
              y: this.entity.points[3].y + this.margin
            });
            this.posEnd = new Point({
              x: this.entity.points[2].x,
              y: this.entity.points[2].y + this.margin
            });
            this.posBox = new Point({
              x: this.posStart.x + (this.posEnd.x - this.posStart.x)/2,
              y: this.posStart.y + 20
            });
            this.value = canvasConversion.convertToMm(this.entity.points[2].x - this.entity.points[3].x);
            break;
          default:
            console.log(loc + '--> terme non reconnu par le constructeur Arrow');
        }
      }

      /**
       * Retourne des coordonnées pour positionner une box-dessin.
       * @returns {{x: number, y: number}}
       */
      getBoxPos(){
        var posBox = {};
        switch(this.loc) {

          case 'right':
            posBox = {
              x: this.posStart.x + 10,
              y: this.posStart.y + (this.posEnd.y - this.posStart.y)/2
            };
            this.value = canvasConversion.convertToMm(this.entity.points[2].y - this.entity.points[1].y);
            break;

          case 'bottom':
            posBox = {
              x: this.posStart.x + (this.posEnd.x - this.posStart.x)/2,
              y: this.posStart.y + 20
            };
            this.value = canvasConversion.convertToMm(this.entity.points[2].x - this.entity.points[3].x);
            break;

          default:
            console.log(loc + '--> terme non reconnu par le constructeur Arrow');
        }
        return posBox;
      }

      setTriangleDraw(loc){
        switch(loc) {
          case 'right':
            this.drawTriangle = function(ctx){
              ctx.save();
              ctx.fillStyle='gray';
              ctx.beginPath();
              ctx.moveTo(this.posStart.x, this.posStart.y);
              ctx.lineTo(this.posStart.x - 5, this.posStart.y + 10);
              ctx.lineTo(this.posStart.x + 5, this.posStart.y + 10);
              ctx.closePath();
              ctx.fill();
              ctx.moveTo(this.posEnd.x, this.posEnd.y);
              ctx.lineTo(this.posEnd.x - 5, this.posEnd.y - 10);
              ctx.lineTo(this.posEnd.x + 5, this.posEnd.y - 10);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            };

            this.drawText = function(ctx){
              ctx.save();
              ctx.font = '14px sans-serif';
              ctx.fillText(this.value + ' mm', this.posBox.x, this.posBox.y);
              ctx.restore();
            };

            this.drawCanvas = function(ctx){
              ctx.beginPath();
              ctx.fillRect(this.posStart.x, this.posStart.y + 5, 1, this.posEnd.y - this.posStart.y - 5);
              ctx.closePath();
              this.drawTriangle(ctx);
              //this.drawText(ctx);
            };
            break;
          case 'bottom':
            this.drawTriangle = function (ctx){
              ctx.save();
              ctx.fillStyle='gray';
              ctx.beginPath();
              ctx.moveTo(this.posStart.x, this.posStart.y);
              ctx.lineTo(this.posStart.x + 10, this.posStart.y - 5);
              ctx.lineTo(this.posStart.x + 10, this.posStart.y + 5);
              ctx.closePath();
              ctx.fill();
              ctx.moveTo(this.posEnd.x, this.posEnd.y);
              ctx.lineTo(this.posEnd.x - 10, this.posEnd.y - 5);
              ctx.lineTo(this.posEnd.x - 10, this.posEnd.y + 5);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            };

            this.drawText = function(ctx){
              ctx.save();
              ctx.font = '14px sans-serif';
              ctx.fillText(this.value + ' mm', this.posBox.x, this.posBox.y);
              ctx.restore();
            };

            this.drawCanvas = function(ctx){
              ctx.beginPath();
              ctx.fillRect(this.posStart.x + 5, this.posStart.y, this.posEnd.x - this.posStart.x - 5, 1);
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
              this.entity.points[2].translate({x:newVal - posExtreme.size.w, y: 0});
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

      newTexte: function(obj) {
        return new Texte(obj);
      },

      // newPoly: function (entity) {
      //   return new Poly(entity);
      // }
      
    };

  });
