'use strict';

angular.module('pedaleswitchApp')
  .factory('canvasGlobalServ', function ($window) {

    var canvasGlobal = {
      canvas: {
        canvasWindow: {},
        canvas: {},
        ctx: {},
        marginCanvas: 40
      },
      state: {
        debrayable: false,
        viewState: 'up',
        isActive: 'Effet'
      },
      zoomOptions: {
        resolution: 2,
        resoInMm: 1,
        oldZoom: 1,
        zoom: 1,
        ratioW: 3/4.2,
        ratioH: 300
      },
      composantItems: { }, // Liste de tout les composants dans la db
      selections: [ ], // Liste de tout les effets que l'utilisateur à sélectionné dans la biblio.
      boite: {
        projBoite: {}, // Contient la projection de la boite pour la vue active.
        masterBoite: {} // Contient l'objet masterboite qui lui même contient les projections des boites suivant les vues
      },
      tables: {
        tableEffet: [],
        tableComposant: [],
        tableActive: [],
        tableDrawDashed: [],
        tableDrawThin: [],
        tableDrawShine: [],
        tableAlignLine: [],
        tableText: [],
        tableArrow: [],
        activeItem: [],
        // @todo a supprimer, table de travail.
        tableDrawLimits: []
      }
    };

    // Public API here
    return{

      getCanvasGlobal: function(){
        return canvasGlobal;
      },

      /////// Canvas Part.
      getCanvasS: function(){
        return canvasGlobal.canvas;
      },

      setCanvasWindow: function(canvasWindow){
        canvasWindow.style.width = canvasGlobal.canvas.canvas.width.toString() + 'px';
        canvasWindow.style.height = canvasGlobal.canvas.canvas.height.toString() + 'px';
        canvasGlobal.canvas.canvasWindow = canvasWindow;
      },

      setCanvas: function(canv){
        canv.width = $window.innerWidth * canvasGlobal.zoomOptions.ratioW;
        canv.height = $window.innerHeight - canvasGlobal.zoomOptions.ratioH;
        canvasGlobal.canvas.canvas = canv;
      },

      setCtx: function(context) {
        canvasGlobal.canvas.ctx = context;
      },

      getCtx: function(context) {
        return canvasGlobal.canvas.ctx;
      },

      setMarginCanvas: function(margin){
        canvasGlobal.canvas.marginCanvas = margin;
      },
      /////////////////////////////// Fin Canvas Part.


      /////////// State part.
      setDeb: function(deb){
        canvasGlobal.state.debrayable = deb;
      },

      getDeb: function(){
        return canvasGlobal.state.debrayable;
      },

      setViewState: function(state){
        canvasGlobal.state.viewState = state;
      },

      getViewState: function(){
        return canvasGlobal.state.viewState;
      },

      setIsActive: function(active){
        canvasGlobal.state.isActive = active;
      },
      /////////////////////// Fin state part.


      /////// ZoomOptions part.
      getZoom: function(){
        return Math.round(canvasGlobal.zoomOptions.zoom * 100);
      },

      getZoomOptions: function(){
        return canvasGlobal.zoomOptions;
      },
      /////////// Fin ZoomOptions part.

      //////// Selection part.
      getSelections: function(){
        return canvasGlobal.selections;
      },

      resetSelections: function(){
        return this.reset(canvasGlobal.selections);
      },

      setSelections: function(tab){
        return this.set(canvasGlobal.selections, tab);
      },
      ///////////////////////// Fin selection part.

      getComposantItems: function(){
        return canvasGlobal.composantItems;
      },

      setComposantItems: function(tab){
        return this.set(canvasGlobal.composantItems, tab);
      },


      //////// Boite part.
      getBoite: function(){
        return canvasGlobal.boite;
      },

      setMasterBoite: function(bo){
        canvasGlobal.boite.masterBoite = bo;
        return canvasGlobal.boite.masterBoite;
      },

      getMasterBoite: function(){
        return canvasGlobal.boite.masterBoite;
      },

      setProjBoite: function(bo){
        canvasGlobal.boite.projBoite = bo;
        return canvasGlobal.boite.projBoite;
      },

      getProjBoite: function(){
        return canvasGlobal.boite.projBoite;
      },

      resetBoite: function(){
        canvasGlobal.boite.projBoite = {};
        canvasGlobal.boite.masterBoite = {};
      },
      ///////////////// Fin boite part.


      resetIsSelected: function(tab) {
        for (var i = 0; i < tab.length; i++){
          tab[i].isSelected = false;
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
        for(var i = 0; i < canvasGlobal.tables.tableEffet.length; i++){
          if(canvasGlobal.tables.tableEffet[i].key === key) {
            return canvasGlobal.tables.tableEffet[i];
          }
        }
        return false;
      },

      searchEffetById: function(id, key){
        for(var i = 0; i < canvasGlobal.tables.tableEffet.length; i++){
          if(canvasGlobal.tables.tableEffet[i]._id === id && canvasGlobal.tables.tableEffet[i].key === key) {
            return canvasGlobal.tables.tableEffet[i];
          }
        }
        return false;
      },

      searchCompoById: function(id, key){
        for(var i = 0; i < canvasGlobal.tables.tableComposant.length; i++){
          if(canvasGlobal.tables.tableComposant[i]._id === id && canvasGlobal.tables.tableComposant[i].key === key) {
            return canvasGlobal.tables.tableComposant[i];
          }
        }
        return false;
      },

      searchEffetInSelections: function(id, key){
        for(var i = 0; i < canvasGlobal.selections.length; i++){
          if(canvasGlobal.selections[i]._id === id && canvasGlobal.selections[i].key === key){
            return canvasGlobal.selections[i];
          }
        }
        return false;
      },

      affectEffetInSelections: function(effet){
        for(var i = 0; i < canvasGlobal.selections.length; i++){
          if(canvasGlobal.selections[i]._id === effet._id && canvasGlobal.selections[i].key === effet.key){
            canvasGlobal.selections[i] = effet;
          }
        }
        return false;
      },

      /////////////// Getter & Setter Tables part.
      /**
       * Fonction générique qui permet de supprimer les éléments
       * d'une table sans supprimer la table pour ne pas
       * perdre les variables qui ont été passé par références.
       * @param tab
       */
      reset: function(tab){
        tab.splice(0, tab.length);
      },

      /**
       * Fonction générique pour mettre tabOld égale à tabNew
       * sans perdre la référence.
       * @param tabOld
       * @param tabNew
       * @returns {*}
       */
      set: function(tabOld, tabNew){
        this.reset(tabOld);
        for (var k = 0; k < tabNew.length; k++ ) {
          tabOld.push(tabNew[k]);
        }
        return tabOld;
      },

      getTables: function(){
        return canvasGlobal.tables;
      },

      setTableEffet: function(tab) {
        return this.set(canvasGlobal.tables.tableEffet, tab);
      },

      getTableEffet: function(){
        return canvasGlobal.tables.tableEffet;
      },

      resetTableEffet: function(){
        return canvasGlobal.tables.tableEffet = [];
      },

      setTableComposant: function(tab) {
        return this.set(canvasGlobal.tables.tableComposant, tab);
      },

      getTableComposant: function(){
        return canvasGlobal.tables.tableComposant;
      },

      resetTableComposant: function(){
        return this.reset(canvasGlobal.tables.tableComposant);
      },

      setTableActive: function(tab){
        return canvasGlobal.tables.tableActive = tab;
      },

      autoSetTableActive: function(){
        switch (canvasGlobal.state.isActive){
          case 'Effet':
            canvasGlobal.tables.tableActive = canvasGlobal.tables.tableEffet;
            break;
          case 'Composant':
            canvasGlobal.tables.tableActive = canvasGlobal.tables.tableComposant;
            break;
          default:
            canvasGlobal.tables.tableActive = canvasGlobal.tables.tableEffet;
        }
        return canvasGlobal.tables.tableActive;
      },

      getTableActive: function(){
        return canvasGlobal.tables.tableActive;
      },

      resetTableActive: function(){
        return canvasGlobal.tables.tableActive = [];
      },

      setTableDrawDashed: function(tab){
        return canvasGlobal.tables.tableDrawDashed = tab;
      },

      getTableDrawDashed: function(){
        return canvasGlobal.tables.tableDrawDashed;
      },

      resetTableDrawDashed: function(){
        return canvasGlobal.tables.tableDrawDashed = [];
      },

      setTableDrawThin: function(tab){
        return canvasGlobal.tables.tableDrawThin = tab;
      },

      getTableDrawThin: function(){
        return canvasGlobal.tables.tableDrawThin;
      },

      resetTableDrawThin: function(){
        return canvasGlobal.tables.tableDrawThin = [];
      },

      setTableDrawShine: function(tabr){
        for (var i = 0; i < tabr.length; i++){
          tabr[i].isSelected = true;
        }
        return canvasGlobal.tables.tableDrawShine = tabr;
      },

      getTableDrawShine: function(){
        return canvasGlobal.tables.tableDrawShine;
      },

      resetTableDrawShine: function(){
        for (var i = 0; i < canvasGlobal.tables.tableDrawShine.length; i++){
          canvasGlobal.tables.tableDrawShine[i].isSelected = false;
        }
        return canvasGlobal.tables.tableDrawShine = [];
      },

      setTableAlignLine: function(tab) {
        return canvasGlobal.tables.tableAlignLine = tab;
      },

      getTableAlignLine: function(){
        return canvasGlobal.tables.tableAlignLine;
      },

      resetTableAlignLine: function(){
        return canvasGlobal.tables.tableAlignLine = [];
      },

      getTableText: function() {
        return canvasGlobal.tables.tableText;
      },

      setTableText: function(tab) {
        return this.set(canvasGlobal.tables.tableText, tab);
      },

      resetTableText: function() {
        return this.reset(canvasGlobal.tables.tableText);
      },

      setTableArrow: function(tab) {
        return this.set(canvasGlobal.tables.tableArrow, tab);
      },

      getTableArrow: function(){
        return canvasGlobal.tables.tableArrow;
      },

      resetTableArrow: function(){
        return this.reset(canvasGlobal.tables.tableArrow);
      },

      setActiveItem: function(item){
        this.reset(canvasGlobal.tables.activeItem);
        canvasGlobal.tables.activeItem.push(item);
        return canvasGlobal.tables.activeItem;
      },

      getActiveItem: function(){
        return canvasGlobal.tables.activeItem;
      },

      resetActiveItem: function(){
        return this.reset(canvasGlobal.tables.activeItem);
      },

      //////////// @Todo : a supprimer, table de travail.
      setTableDrawLimits: function(tab){
        return canvasGlobal.tables.tableDrawLimits = tab;
      },

      getTableDrawLimits: function(){
        return canvasGlobal.tables.tableDrawLimits;
      },

      resetTableDrawLimits: function(){
        return canvasGlobal.tables.tableDrawLimits = [];
      },
      /////////////// Fin todo.

      resetAll: function(){
        this.resetTableEffet();
        this.resetTableComposant();
        this.resetTableActive();
        this.resetTableDrawDashed();
        this.resetTableDrawThin();
        this.resetTableDrawShine();
        this.resetTableAlignLine();
        this.resetTableText();
        this.resetTableArrow();
        this.resetActiveItem();
        this.resetTableDrawLimits();

        //this.resetSelections();
        //this.resetBoite();
        //this.getComposantItems();
      }
      /////////////////////////////////////////// End getter & setter table part.


    };
  });
