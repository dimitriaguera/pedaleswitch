'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasControl', function (canvasGeneration, canvasConversion, checkCollision, rulers) {
    // Service logic

    var ctx = {};
    var canvas = {};
    var canvas_window = {};
    var boite = {};
    var masterBoite = {};
    var tableMasterEffet = [];
    var tableMasterComposant = [];
    var tableEffet = [];
    var tableComposant = [];
    var tableActive = [];
    var tableDrawDashed = [];
    var tableDrawThin = [];
    var tableDrawShine = [];
    var tableAlignLine = [];
    var tableArrow = [];
    var activeItem = [];
    var debrayable = false;
    var viewState = 'up';

    var thing = function(entity) {
      switch (entity.item_info.shape){
        case 'Rect':
          return canvasGeneration.newRect(entity);
          break;
        case 'Cercle':
          return canvasGeneration.newCercle(entity);
          break;
        case 'Poly':
          //return canvasGeneration.newPoly(entity);
          break;
        default:
          console.log('Shape not match in canvasControl :' + entity.shape);
          return false;
      }      
    };
        
    // Public API here
    return{
      
      
      /**
       * Cette fonction créé les objets du canvas à partir du modèle dessin.
       * Et l'ajoute dans tableEffet et tableComposant pour les composants correspondants.
       *
       * @param effet : objet effet du modele dessin (entrée de la table option du panier).
       * @para bol : si true alors rajoute l'effet meme si il est deja dans le canvas
       *             sert au fonction de chargement depuis la db ou localstorage.
       */
      addToCanvas: function(effet, bol) {
        bol = bol || false;

        // if check si l'effet est deja dans le canvas.
        if (!effet.in_canvas || bol) {
          var tmp_master_eff = canvasGeneration.newMasterShape(effet, viewState);
          var tmp_master_comp = [];
          var compos = effet.composants;
          for (var i = 0; i < compos.length; i++) {
            tmp_master_comp = canvasGeneration.newMasterShape(compos[i], viewState);
            tableMasterComposant.push(tmp_master_comp);
            tmp_master_eff.composants.push(tmp_master_comp);
            tableComposant.push(tmp_master_comp.projections[viewState]);
            tmp_master_eff.projections['top'].composants.push(tmp_master_comp.projections['top']);
            tmp_master_eff.projections['bottom'].composants.push(tmp_master_comp.projections['bottom']);
            tmp_master_eff.projections['up'].composants.push(tmp_master_comp.projections['up']);
            tmp_master_eff.projections['down'].composants.push(tmp_master_comp.projections['down']);
            tmp_master_eff.projections['left'].composants.push(tmp_master_comp.projections['left']);
            tmp_master_eff.projections['right'].composants.push(tmp_master_comp.projections['right']);
          }
          
          // Créer le boitier de la pedale.
          if(boite.constructor.name !== "Boite") {
            this.setMasterBoite(canvasGeneration.newMasterBoite());

            // Convert marge en px.
            masterBoite.convertMargin();
            masterBoite.convertInitialHeight();

            // On sélectionne la bonne projection.
            this.setBoite(masterBoite.projections[viewState]);

            // Empeche que l'effet depasse du canvas.
            this.moveCloseBorder(tmp_master_eff.projections[viewState]);

            // Place bien les composants.
            tmp_master_eff.projections[viewState].resetCompPos();

            // Initiliase la boite.
            boite.initBoiteWithEffect(tmp_master_eff.projections[viewState]);

            // Lie les effets a la boite
            boite.effets = tableEffet;

            // Créer les flèches autour de la boite.
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
          }
          else {
            // Empeche que l'effet depasse du canvas.
            this.moveCloseBorder(tmp_master_eff.projections[viewState]);
            // Place bien les composants.
            if (!effet.in_canvas) {
              tmp_master_eff.projections[viewState].resetCompPos();
            }
            // Redimensionne la boite si le nouvelle effet est en dehors.
            boite.checkBorderBoite(tmp_master_eff.projections[viewState]);
            // Repositionne les arraw.
            this.setArrowPos();
          }
          // Rajoute la propriété in_canvas a l'effet.
          effet.in_canvas = true;

          // Rajoute l'effet a la table effet et le master dans la table MesterEffet.
          tableEffet.push(tmp_master_eff.projections[viewState]);
          tableMasterEffet.push(tmp_master_eff);

          // Check les collisions entre tout les obj.
          checkCollision.checkAll(tableEffet);

          return tmp_master_eff.projections[viewState];
        }
      },

      /**
       * Enlève l'effet du canvas.
       * @param effet
       */
      removeToCanvas: function(effet) {
        var index = this.searchTabByIdReturnIndex(tableEffet, effet._id, effet.key);
        if(index !== false){
          effet.in_canvas = false;
          var removeIndex = [];
          for (var i = 0  ; i < tableComposant.length ; i++) {
            if (effet.key === tableComposant[i].key) {
              removeIndex.push(i);
            }
          }
          for (i = removeIndex.length -1; i >= 0; i--){
            tableComposant.splice(removeIndex[i],1);
          }
          tableEffet.splice(index,1);
        }
      },


      /**
       * Réorganise les tables maîtres canvas selon l'état passé en argument.
       *
       * @param state : string - 'top', 'bottom', 'up', 'down', 'left', 'right'
       */
      canvasViewState: function (state) {

        var m = tableMasterEffet.length;
        var n = tableMasterComposant.length;
        var i, j;

        switch (state) {
          case 'top':
            viewState = 'top';
            this.resetAll();
            this.setBoite(masterBoite.projections.top);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            for (i = 0; i < m; i++) {
              tableEffet.push(tableMasterEffet[i].projections.top);
            }
            for (j = 0; j < n; j++) {
              tableComposant.push(tableMasterComposant[j].projections.top);
            }
            break;
          case 'bottom':
            viewState = 'bottom';
            this.resetAll();
            this.setBoite(masterBoite.projections.bottom);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            for (i = 0; i < m; i++) {
              tableEffet.push(tableMasterEffet[i].projections.bottom);
            }
            for (j = 0; j < n; j++) {
              tableComposant.push(tableMasterComposant[j].projections.bottom);
            }
            break;
          case 'up':
            viewState = 'up';
            this.resetAll();
            this.setBoite(masterBoite.projections.up);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            for (i = 0; i < m; i++) {
              tableEffet.push(tableMasterEffet[i].projections.up);
            }
            for (j = 0; j < n; j++) {
              tableComposant.push(tableMasterComposant[j].projections.up);
            }
            break;
          case 'down':
            viewState = 'down';
            this.resetAll();
            this.setBoite(masterBoite.projections.down);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            for (i = 0; i < m; i++) {
              tableEffet.push(tableMasterEffet[i].projections.down);
            }
            for (j = 0; j < n; j++) {
              tableComposant.push(tableMasterComposant[j].projections.down);
            }
            break;
          case 'left':
            viewState = 'left';
            this.resetAll();
            this.setBoite(masterBoite.projections.left);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            for (i = 0; i < m; i++) {
              tableEffet.push(tableMasterEffet[i].projections.left);
            }
            for (j = 0; j < n; j++) {
              tableComposant.push(tableMasterComposant[j].projections.left);
            }
            break;
          case 'right':
            viewState = 'right';
            this.resetAll();
            this.setBoite(masterBoite.projections.right);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            //for (i = 0; i < m; i++) {
            //  tableEffet.push(tableMasterEffet[i].projections.right);
            //}
            //for (j = 0; j < n; j++) {
            //  tableComposant.push(tableMasterComposant[j].projections.right);
            //}
            break;
          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      },

      /**
       * Réorganise les tables esclaves canvas selon l'état passé en argument.
       *
       * @param state : string - 'effet', 'composant'
       * @return true si effet dans le canvas, false si canvas vide.
       */
      canvasDrawState: function (state) {

        var active, inactive;

        switch(state) {

          case 'effet':
            active = tableEffet;
            inactive = tableComposant;
            this.isActive = 'effet';
            this.resetIsSelected(active);
            this.resetIsSelected(inactive);
            this.resetTableDrawDashed();
            this.setTableActive(active);
            this.setTableDrawThin(inactive);
            return (active.length > 0);
            break;

          case 'composant':
            active = tableComposant;
            inactive = tableEffet;
            this.isActive = 'composant';
            this.resetIsSelected(active);
            this.resetIsSelected(inactive);
            this.resetTableDrawThin();
            this.setTableActive(active);
            this.setTableDrawDashed(inactive);
            return (active.length > 0);
            break;

          default:
            return console.log('ERROR ' + state + ' is not a valid state');
        }
      },

      /**
       * Restaure un canvas a partir d'une instance de Dessin.
       * 
       * @param dessin
       */
      restoreCanvas: function(dessin){
        // Regénère la boite.
        boite = canvasGeneration.newBoite();
        boite.initBoiteWithBoite(dessin.boite);
        boite.effets = tableEffet;
        dessin.boite = boite;
        this.resizeCanvas();
        // Créer les flèches autour de la boite.
        tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
        tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));

        // Rajoute tout les effets au canvas.
        //@todo addToCanvas with load option car on peut pas faire incanvas...
        for (var i = 0 ; i < dessin.options.length ; i++){
          if (dessin.options[i].in_canvas === true){
            this.addToCanvas(dessin.options[i], true);
          }
        }
      },

      /**
       * Agrandit le canvas pour qu'il soit au moins aussi grand que la boite.
       */
      resizeCanvas: function(){
        if (boite.constructor.name === "Boite") {
          var realmargin = 150;
          var bbot = boite.getBottom(),
            bright = boite.getRight();

          // Debordement par la droite.
          if (bright + realmargin > canvas.width) {
            canvas.width = bright + realmargin;
          }
          // Debordement par le bas.
          if (bbot + realmargin > canvas.height) {
            canvas.height = bbot + realmargin;
          }
        }
      },

      /**
       * Donne les coordonnées d'un rectangle qui entoure tout les objs.
       *
       * Cette fonction retourne :
       * t : position la plus petite de l'obj le plus en haut.
       * r : position la plus grande de l'obj le plus à droite.
       * b : position la plus grande de l'obj le plus en bas.
       * l : la position la plus petite de l'obj le plus à gauche.
       *
       * @returns {{t: number, r: number, b: number, l: number}}
       */

      findGobalRect: function (){
        var saveMax = function(posmax, pos){
          posmax.t = Math.min(posmax.t, pos.t);
          posmax.r = Math.max(posmax.r, pos.r);
          posmax.b = Math.max(posmax.b, pos.b);
          posmax.l = Math.min(posmax.l, pos.l);
        };

        var i, j;

        var effet;
        var compos, compo;
        
        var pos = {t:Infinity,r:-Infinity,b:-Infinity,l:Infinity},
            posmax = {t:Infinity,r:-Infinity,b:-Infinity,l:Infinity};

        for (i = 0 ; i < tableEffet.length ; i++) {
          effet = tableEffet[i];

          // Recupère les bords
          pos = effet.getMax();
          // Garde le maximum.
          saveMax(posmax, pos);
          
          if (debrayable){
            compos = effet.composants;
            for (j = 0; j < compos.length; j++) {
              compo = compos[j];
              // Recupère les bords
              pos = compo.getMax();
              // Garde le maximum.
              saveMax(posmax, pos);
            }
          }
        }
        
        return posmax;
      },


      /**
       * Empeche que l'effet depasse du canvas.
       * @param effet
       */
      moveCloseBorder: function(effet){
        // On deplace un effet.
        if (effet.constructor.name !== "Boite"){
          this.moveCloseBorderGenerale(effet, boite.margin.v);
        } 
        // On deplace la boite.  
        else {
          this.moveCloseBorderGenerale(effet, 0);
        }
      },

      /**
       * Permet de modifier les coordonnées d'un thing s'il depasse les bordures.
       * @todo a reflechir.
       * @param entity = thing
       * @param addmargin = int
       */
      moveCloseBorderGenerale: function(entity, addmargin) {
        var margin = canvasConversion.convertToPixel(40);

        var realmargin = margin + addmargin;
        
        // Regarde si la figure sort du canvas.
        var max_pos = entity.getMax();

        // Debordement par le haut.
        if (max_pos.t < realmargin) {
          entity.setCenterY(entity.size.h.v / 2 + realmargin);
          max_pos.b = entity.getBottom();
        }
        // Debordement par la gauche.
        if (max_pos.l < realmargin) {
          entity.setCenterX(entity.size.w.v / 2 + realmargin);
          max_pos.r = entity.getRight();
        }
        // Debordement par la droite.
        if (max_pos.r + realmargin + 150 > canvas.width) {
          canvas.width = max_pos.r + realmargin + 150;
        }
        // Debordement par le bas.
        if (max_pos.b + realmargin + 150 > canvas.height) {
          canvas.height = max_pos.b + realmargin + 150;
        }
      },
            
      //@todo optimisation possible check arraw active.
      setArrowPos: function(){
        for(var i = 0; i < tableArrow.length; i++){
          tableArrow[i].setPos(tableArrow[i].loc);
        }
      },

      resetCompPos: function(value){
        if (!value) {
          for (var i = 0; i < tableEffet.length; i++) {
            tableEffet[i].resetCompPos();
          }
        }
      },

      resetIsSelected: function(tabr) {
        for (var i = 0; i < tabr.length; i++){
          tabr[i].isSelected = false;
        }
      },
      
      updateComposantInCanvas: function(compo){
        var effet = this.searchEffetByKey(compo.key);
        if (effet) {
          var index_effet = this.searchTabByIdReturnIndex(tableEffet, effet._id, effet.key);
          var index_effet_compo = this.searchTabByIdReturnIndex(tableEffet[index_effet].composants, compo._id, compo.key);
          var index_compo = this.searchTabByIdReturnIndex(tableComposant, compo._id, compo.key);
          tableEffet[index_effet].composants[index_effet_compo] = tableComposant[index_compo] = thing(compo);
        }
      },

      searchTabByIdReturnIndex: function(tab, id, key){
        for(var i = 0; i < tab.length; i++){
          if(tab[i]._id === id && tab[i].key === key) {
            return i;
          }
        }
        return false;
      },

      searchEffetByKey: function(key){
        for(var i = 0; i < tableEffet.length; i++){
          if(tableEffet[i].key === key) {
            return tableEffet[i];
          }
        }
        return false;
      },

      searchEffetById: function(id, key){
        for(var i = 0; i < tableEffet.length; i++){
          if(tableEffet[i]._id === id && tableEffet[i].key === key) {
            return tableEffet[i];
          }
        }
        return false;
      },

      searchCompoById: function(id, key){
        for(var i = 0; i < tableComposant.length; i++){
          if(tableComposant[i]._id === id && tableComposant[i].key === key) {
            return tableComposant[i];
          }
        }
        return false;
      },

      getZoom: function(){
        return canvasConversion.getZoomRatio();
      },
      
      setBoite: function(bo){
        boite = bo;
      },

      getBoite: function(){
        return boite;
      },

      setMasterBoite: function(bo){
        masterBoite = bo;
      },

      getMasterBoite: function(){
        return masterBoite;
      },

      setDeb: function(deb){
        debrayable = deb;
      },

      getDeb: function(){
        return debrayable;
      },

      setCanvas: function(canv){
        var canvasSize = canvasConversion.getCanvasSize();
        canv.width = canvasSize.w;
        canv.height = canvasSize.h;
        canvas = canv;
      },

      setCanvasWindow: function(canv_window){
        var canvasSize = canvasConversion.getCanvasSize();
        canv_window.style.width = canvasSize.w.toString() + "px";
        canv_window.style.height = canvasSize.h.toString() + "px";
        canvas_window = canv_window;
      },

      getCanvas: function(){
        return canvas;
      },

      setCtx: function(context) {
        ctx = context;
      },

      getCtx: function(){
        return ctx;
      },

      setTableEffet: function(tabr) {
        var i = tableEffet.length;
        var j = tabr.length;
        tableEffet.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableEffet.push(tabr[k]);
        }
        return tableEffet;
      },

      getTableEffet: function(){
        return tableEffet;
      },

      resetTableEffet: function(){
        var i = tableEffet.length;
        tableEffet.splice(0, i);
      },

      setTableComposant: function(tabr) {
        var i = tableComposant.length;
        var j = tabr.length;
        tableComposant.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableComposant.push(tabr[k]);
        }
        return tableComposant;
      },

      getTableComposant: function(){
        return tableComposant;
      },

      resetTableComposant: function(){
        var i = tableComposant.length;
        tableComposant.splice(0, i);
      },

      setActiveItem: function(item){
        var i = activeItem.length;
        activeItem.splice(0, i);
        activeItem.push(item);
        return activeItem;
      },

      getActiveItem: function(){
        return activeItem;
      },

      resetActiveItem: function(){
        var i = activeItem.length;
        activeItem.splice(0, i);
      },

      setTableAlignLine: function(tabr) {
        var i = tableAlignLine.length;
        var j = tabr.length;
        tableAlignLine.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableAlignLine.push(tabr[k]);
        }
        return tableAlignLine;
      },

      getTableAlignLine: function(){
        return tableAlignLine;
      },

      resetTableAlignLine: function(){
        var i = tableAlignLine.length;
        tableAlignLine.splice(0, i);
      },

      setTableArrow: function(tabr) {
        var i = tableArrow.length;
        var j = tabr.length;
        tableArrow.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableArrow.push(tabr[k]);
        }
        return tableArrow;
      },

      getTableArrow: function(){
        return tableArrow;
      },

      resetTableArrow: function(){
        var i = tableArrow.length;
        tableArrow.splice(0, i);
      },

      setTableActive: function(tabr){
        tableActive = tabr;
      },

      getTableActive: function(){
        return tableActive;
      },

      resetTableActive: function(){
        tableActive = [];
      },

      setTableDrawDashed: function(tabr){
        tableDrawDashed = tabr;
      },

      getTableDrawDashed: function(){
        return tableDrawDashed;
      },

      resetTableDrawDashed: function(){
        tableDrawDashed = [];
      },

      setTableDrawShine: function(tabr){
        for (var i = 0; i < tabr.length; i++){
          tabr[i].isSelected = true;
        }
        tableDrawShine = tabr;
      },

      getTableDrawShine: function(){
        return tableDrawShine;
      },
      
      resetTableDrawShine: function(){
        for (var i = 0; i < tableDrawShine.length; i++){
          tableDrawShine[i].isSelected = false;
        }
        tableDrawShine = [];
      },

      setTableDrawThin: function(tabr){
        checkCollision.checkAll(tabr);
        tableDrawThin = tabr;
      },

      getTableDrawThin: function(){
        return tableDrawThin;
      },

      resetTableDrawThin: function(){
        tableDrawThin = [];
      },

      resetAll: function(){
        boite = {};
        this.resetTableEffet();
        this.resetTableComposant();
        this.resetTableActive();
        this.resetTableDrawDashed();
        this.resetTableDrawThin();
        this.resetTableDrawShine();
        this.resetTableAlignLine();
        this.resetTableArrow();
        debrayable = false;
      },
      
      //zoomInitialize: function(value){
      //  canvasConversion.setZoom(value);
      //  for (var i = 0; i < tableEffet.length; i++) {
      //    canvasConversion.initializeEffetZoom(tableEffet[i]);
      //  }
      //  this.drawStuff();
      //},
      //
      //zoomChange: function(value){
      //  var okZoom = canvasConversion.setZoom(value);
      //  if (okZoom) {
      //    for (var i = 0; i < tableEffet.length; i++) {
      //      canvasConversion.convertEffetZoom(tableEffet[i]);
      //    }
      //    this.drawStuff();
      //  }
      //  return okZoom;
      //},

      // @todo a supprimer
      drawRulers: function() {
        rulers.render(canvas, ctx, '#aaa', 'pixels', 100);
      },

      // @todo a supprimer
      drawGrid: function() {
        rulers.drawGrid(canvas, ctx);
      },

      // @todo a supprimer
      tableState: function(){
        return {
          masterBoite: masterBoite,
          boite: boite,
          tableMasterEffet: tableMasterEffet,
          tableMasterComposant: tableMasterComposant,
          tableEffet: tableEffet,
          tableComposant: tableComposant,
          tableActive: tableActive,
          tableDrawDashed:  tableDrawDashed,
          tableDrawThin: tableDrawThin,
          tableDrawShine: tableDrawShine,
          tableArrow:  tableArrow
        }
      }
      
    };
  });
