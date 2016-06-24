'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasControl', function (canvasGeneration, canvasConversion, checkCollision, rulers, $rootScope) {
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
    var tableText = [];
    var tableArrow = [];
    var activeItem = [];

    var debrayable = false;
    var viewState = 'up';
    var isActive = 'effet';

    var color = '';
    var activeItemBak= [];

    var marginCanvas = canvasConversion.convertToPixel(40);
    
    
    var thing = function(entity) {
      switch (entity.item_info.shape){
        case 'Rect':
          return canvasGeneration.newRect(entity);
          break;
        case 'Cercle':
          return canvasGeneration.newCercle(entity);
          break;
        case 'Poly':
          return canvasGeneration.newPoly(entity);
          break;
        default:
          console.log('Shape not match in canvasControl :' + entity.shape);
          return false;
      }
    };

    var setActiveItem = function(item){
      return this.setActiveItem(item);
    };

    // Public API here
    return{

      eyedropper: function(){
        // Sauve les items actifs et les supprimes pour enlever le pop-up.
        activeItemBak = this.getActiveItem()[0];
        this.resetActiveItem();
        // Change le pointer de la souris
        document.body.style.cursor = "url('http://wiki-devel.sugarlabs.org/images/e/e2/Arrow.cur'), auto";
        $rootScope.$emit('color');
      },


      mouseDownColor: function(a, e){
        var mousePos = {x: e.layerX ,y: e.layerY};
        var data = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
        var rgba = 'rgba(' + data[0] + ',' + data[1] +
          ',' + data[2] + ',' + data[3] + ')';

        // change la couleur de l'item actif.
        activeItemBak.font.color = tinycolor(rgba).toHex();

        // restore les items actifs.
        this.setActiveItem(activeItemBak);

        $rootScope.$emit('click-on-deco');
      },


      /**
       * Cette fonction créé les objets du canvas à partir du modèle dessin.
       * Et l'ajoute dans tableEffet et tableComposant pour les composants correspondants.
       *
       * @param effet : objet effet du modele dessin (entrée de la table option du panier).
       * @para bol : si true alors rajoute l'effet meme si il est deja dans le canvas
       *             sert au fonction de chargement depuis la db ou localstorage.
       * @para pos : met l'effet à la position donnée par pos.
       */
      addToCanvas: function(effet, bol, pos) {
        bol = bol || false;
        pos = pos || null;

        // if check si l'effet est deja dans le canvas.
        if (!effet.in_canvas || bol) {
          var tmp_eff = canvasGeneration.newRect(effet);
          var compos = effet.composants;
          var tmp_comp;

          if (pos){
            tmp_eff.moveTo(pos);
            if (debrayable){
              tmp_eff.resetCompPos();
            }
          }

          // Créer le boitier de la pedale.
          if(boite.constructor.name !== "Boite") {
            this.setMasterBoite(canvasGeneration.newMasterBoite(tmp_eff));

            // Convert marge en px, créer les projections de la boite.
            masterBoite.convertInitialHeight();
            masterBoite.createProjection();

            // On sélectionne la bonne projection.
            this.setBoite(masterBoite.projections[viewState]);

            // Empeche que l'effet depasse du canvas.
            this.moveCloseBorder(tmp_eff);

            // Initialise la position de la boite.
            boite.initMoveBox(tmp_eff);

            
            // Créer les flèches autour de la boite.
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
          }
          else {
            // Empeche que l'effet depasse du canvas.
            this.moveCloseBorder(tmp_eff);

            // Redimensionne la boite si le nouvelle effet est en dehors.
            boite.checkBorderBoite(tmp_eff);

            // Repositionne les arraw.
            this.setArrowPos();
          }

          // Lie les effets et composants a la bonne projection de la boite.
          masterBoite.projections[viewState].effets.push(tmp_eff);

          // On créé les composants.
          for (var i = 0; i < compos.length; i++) {
            tmp_comp = thing(compos[i]);
            tableComposant.push(tmp_comp);
            tmp_eff.composants.push(tmp_comp);
            masterBoite.projections[viewState].composants.push(tmp_comp);
          }

          // Place bien les composants.
          if (!effet.in_canvas) {
            tmp_eff.resetCompPos();
          }

          // Rajoute la propriété in_canvas a l'effet.
          effet.in_canvas = true;

          // Rajoute l'effet a la table effet et le master dans la table MesterEffet.
          tableEffet.push(tmp_eff);

          // Empeche que l'effet depasse du canvas.
          this.moveCloseBorder(tmp_eff);
          
          // Check les collisions entre tout les obj.
          checkCollision.checkAll(tableEffet);

          return tmp_eff;
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
        masterBoite.updateMaster(viewState);
        switch (state) {
          case 'top':
            viewState = 'top';
            masterBoite.updateProjection(viewState);
            this.resetAll();
            this.setBoite(masterBoite.projections.top);
            this.setTableEffet(masterBoite.projections.top.effets);
            this.setTableComposant(masterBoite.projections.top.composants);
            this.setTableText(masterBoite.projections.top.textDecoration);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            break;
          case 'bottom':
            viewState = 'bottom';
            masterBoite.updateProjection(viewState);
            this.resetAll();
            this.setBoite(masterBoite.projections.bottom);
            this.setTableEffet(masterBoite.projections.bottom.effets);
            this.setTableComposant(masterBoite.projections.bottom.composants);
            this.setTableText(masterBoite.projections.bottom.textDecoration);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            break;
          case 'up':
            viewState = 'up';
            masterBoite.updateProjection(viewState);
            this.resetAll();
            this.setBoite(masterBoite.projections.up);
            this.setTableEffet(masterBoite.projections.up.effets);
            this.setTableComposant(masterBoite.projections.up.composants);
            this.setTableText(masterBoite.projections.up.textDecoration);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            break;
          case 'down':
            viewState = 'down';
            masterBoite.updateProjection(viewState);
            this.resetAll();
            this.setBoite(masterBoite.projections.down);
            this.setTableEffet(masterBoite.projections.down.effets);
            this.setTableComposant(masterBoite.projections.down.composants);
            this.setTableText(masterBoite.projections.down.textDecoration);
            tableArrow.push(canvasGeneration.newArrow(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrow(boite, 'bottom'));
            break;
          case 'left':
            viewState = 'left';
            masterBoite.updateProjection(viewState);
            this.resetAll();
            this.setBoite(masterBoite.projections.left);
            this.setTableEffet(masterBoite.projections.left.effets);
            this.setTableComposant(masterBoite.projections.left.composants);
            this.setTableText(masterBoite.projections.left.textDecoration);
            tableArrow.push(canvasGeneration.newArrowPoint(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrowPoint(boite, 'bottom'));
            break;
          case 'right':
            viewState = 'right';
            masterBoite.updateProjection(viewState);
            this.resetAll();
            this.setBoite(masterBoite.projections.right);
            this.setTableEffet(masterBoite.projections.right.effets);
            this.setTableComposant(masterBoite.projections.right.composants);
            this.setTableText(masterBoite.projections.right.textDecoration);
            tableArrow.push(canvasGeneration.newArrowPoint(boite, 'right'));
            tableArrow.push(canvasGeneration.newArrowPoint(boite, 'bottom'));
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
            //this.isActive = 'effet';
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
            //this.isActive = 'composant';
            this.resetIsSelected(active);
            this.resetIsSelected(inactive);
            this.resetTableDrawThin();
            this.setTableActive(active);
            this.setTableDrawDashed(inactive);
            return (active.length > 0);
            break;

          case 'deco':
            this.resetIsSelected(tableComposant);
            this.resetIsSelected(tableEffet);
            this.resetTableDrawThin();
            this.setTableActive(tableText);
            var mix = tableEffet.concat(tableComposant);
            this.setTableDrawDashed(mix);
            return (tableText.length > 0);
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

          var posExt = boite.findExtreme();

          // Debordement par la droite.
          if (posExt.r + realmargin > canvas.width) {
            canvas.width = posExt.r + realmargin;
          }
          // Debordement par le bas.
          if (posExt.b + realmargin > canvas.height) {
            canvas.height = posExt.b + realmargin;
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
      findGlobalRect: function (){
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
          pos = effet.findExtreme();
          // Garde le maximum.
          saveMax(posmax, pos);
          
          if (debrayable){
            compos = effet.composants;
            for (j = 0; j < compos.length; j++) {
              compo = compos[j];
              // Recupère les bords
              pos = compo.findExtreme();
              // Garde le maximum.
              saveMax(posmax, pos);
            }
          }
        }
        
        return posmax;
      },


      /**
       * Empeche que l'effet depasse du canvas.
       * @param entity
       */
      moveCloseBorder: function(entity){
        // On deplace un effet.
        if (entity.fonction !== "Boite"){
          this.moveCloseBorderGenerale(entity, boite.margin);
        } 
        // On deplace la boite.  
        else {
          this.moveCloseBorderGenerale(entity, 0);
        }
      },

      getMarginCanvas: function(){
        return marginCanvas;
      },
      
      /**
       * Permet de modifier les coordonnées d'un thing s'il depasse les bordures.
       * @todo a reflechir.
       * @param entity = thing
       * @param addmargin = int
       */
      moveCloseBorderGenerale: function(entity, addmargin) {
        var realmargin = this.getMarginCanvas() + addmargin;
        
        // Regarde si la figure sort du canvas.
        var max_pos = entity.findExtreme();

        // Debordement par le haut.
        if (max_pos.t < realmargin) {
          entity.move({x:0, y: realmargin - max_pos.t});
        }
        // Debordement par la gauche.
        if (max_pos.l < realmargin) {
          entity.move({x:realmargin - max_pos.l, y:0});
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

      /**
       * Ajoute du texte au canvas.
       * @param string
       */
      addTextToCanvas: function(string, pos) {
        var texte, p;

        p = pos || {x: 400, y: 400};
        texte = canvasGeneration.newTexte(string, ctx);
        texte.moveTo(p);
        masterBoite.projections[viewState].textDecoration.push(texte);

        // Rajoute le texte à la table texte.
        tableText.push(texte);
      },

      getTableText: function() {
        return tableText;
      },

      setTableText: function(tabr) {
        var i = tableText.length;
        var j = tabr.length;
        tableText.splice(0, i);
        for (var k = 0; k < j; k++ ) {
          tableText.push(tabr[k]);
        }
        return tableText;
      },

      resetTableText: function() {
        tableText.splice(0, tableText.length);
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
        return boite;
      },

      getBoite: function(){
        return boite;
      },

      setMasterBoite: function(bo){
        masterBoite = bo;
        return masterBoite;
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
        tableAlignLine = tabr;
        return tableAlignLine;
      },

      getTableAlignLine: function(){
        return tableAlignLine;
      },

      resetTableAlignLine: function(){
        tableAlignLine = [];
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
        this.resetTableText();
      },

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
          tableArrow:  tableArrow,
          tableText: tableText
        }
      }
      
    };
  });
