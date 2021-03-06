'use strict';
(function(){

class PageDessinComponent {

  constructor(canvasGlobalServ, instanceDessin, canvasConversion, canvasControl, canvasDraw, storage, $http, mouseHelper, $timeout) {
    this.$timeout = $timeout;
    this.instanceDessin = instanceDessin;
    this.canvasControl = canvasControl;
    this.canvasConversion = canvasConversion;
    this.canvasDraw = canvasDraw;
    this.storage = storage;
    this.canvasGlobalServ = canvasGlobalServ;
    
    //@todo a sup verifier le oninit.
    this.mouseHelper = mouseHelper;
    this.$http = $http; //@todo a supp et dans la declaration aussi
  }

  $onInit(){

    this.initialisation();

    //@todo a supp et verifier dans le constructor de virer http et OrderArray.
    // this.$http.get('/api/effets').then(response => {
    //   this.effets = response.data;
    //    if(this.selections.length === 0){
    //     this.instanceDessin.setEffet(this.effets[0], this.effets[0].options[0]);
    // //    this.instanceDessin.setEffet(this.effets[1], this.effets[1].options[0]);
    //    }
    // })
  }

  /**
   * Fonction d'initisalisation
   */
  initialisation() {

    // Met les bonnes options.
    this.canvasGlobal = this.canvasGlobalServ.getCanvasGlobal();
    this.zoom = this.canvasGlobalServ.getZoom();
    this.debrayable = this.canvasGlobalServ.getDeb();
    this.deco = false;

    // On en a besoin dans panier-dessin et dans le pop-up de composantItems
    this.composantItems = this.canvasGlobalServ.getComposantItems();
    this.tableArrow = this.canvasGlobalServ.getTableArrow();
    this.selections = this.canvasGlobalServ.getSelections();
    this.activeItem = this.canvasGlobalServ.getActiveItem();
    this.tables = this.canvasGlobalServ.getTables();

    //@todo a SUP
    this.toutesTables = [];

    // Active les effets et les dessines.
    this.activeEffet();
  }

  /**
   * Object passé aux componants box-dessin.
   * Permet de passer pleins de fonction d'un coup dans les different controleur.
   */
  funcMenuPopOver = {
    self: this,
    rotate: function(value, data){
      this.self.rotate(value, data);
    },
    eyeDropper: function(){
      this.self.eyedropper();
    },
    updateComposant: function(compo, value){
      this.self.updateComposant(compo, value);
    },
    dataChange: function(data){
      this.self.dataChange(data);
    },
    arrowChangeValue: function(){
      this.self.arrowChangeValue();
    },
    // @todo a améliorer peut etre ajouter callback qd la font est chargé...
    // Cette fonction permet d'attendre un peu qd on change de font
    // pour etre sur qu'elle soit téléchargé.
    changeFont: function(font, data){
      var self2 = this.self;
      data.font.family = font.stack;
      self2.$timeout(
        function(){
          self2.dataChange(data);
        },
        500
      );
    },
    removeTextToTable: function(data){
      var index = this.self.canvasGlobalServ.searchTabByIdReturnIndex(this.self.tables.tableTextDeco, data._id, data.key);
      this.self.removeTextToTable(index);
    },
    removeShapeToTable: function(data){
      var index = this.self.canvasGlobalServ.searchTabByIdReturnIndex(this.self.tables.tableShapeDeco, data._id, data.key);
      this.self.removeShapeToTable(index);
    },
    removeImgToTable: function(data){
      var index = this.self.canvasGlobalServ.searchTabByIdReturnIndex(this.self.tables.tableImgDeco, data._id, data.key);
      this.self.removeImgToTable(index);
    }
  };


  /////////////////////////////// SAVE & LOAD
  load(){
    // Reset all Canvas.
    this.canvasGlobalServ.resetAll();
    // Recupère dans le local storage.
    var saveData = this.storage.get('saveData');

    // Remet les options.
    this.canvasGlobal.state.debrayable      = saveData.state.debrayable;
    this.canvasGlobal.state.isActive        = saveData.state.isActive;
    this.canvasGlobal.state.viewState       = saveData.state.viewState;
    this.canvasGlobal.zoomOptions.oldZoom   = saveData.zoomOptions.oldZoom;
    this.canvasGlobal.zoomOptions.ratioH    = saveData.zoomOptions.ratioH;
    this.canvasGlobal.zoomOptions.ratioW    = saveData.zoomOptions.ratioW;
    this.canvasGlobal.zoomOptions.resoInMm  = saveData.zoomOptions.resoInMm;
    this.canvasGlobal.zoomOptions.zoom      = saveData.zoomOptions.zoom;

    // Remet la selection.
    // @todo check db pour voir si cela existe encore.
    this.canvasGlobalServ.setSelections(saveData.selections);

    // Remet les composantsItems
    // @todo a refaire
    //this.canvasGlobalServ.setComposantItems(saveData.composantItems);

    // Re créer la masterboite, rajoute les effets, composants dans le canvas.
    this.canvasControl.restoreCanvas(saveData);

    // Active la table effet et dessine.
    this.activeEffet();
  }

  save(){
    // Stock.
    this.storage.put('saveData', this.canvasGlobal);
  }
  /////////////////////////////// FIN SAVE & LOAD

  //////////////////// ADD & REmove EFFET et deco
  /**
   * Rajoute un effet au canvas
   * Appeler par panier dessin et quand on droppable directive
   * Effet est en fait une selection (sortie DB) et pas encore un obj effet
   * @param effet
   */
  addToTable(effet){
    // Ajouter l'effet au canvas si pas deja.
    if (!effet.inCanvas) {this.canvasControl.addToCanvas(effet);}
    // Initialise le boite dans l'instance de dessin.
    //this.instanceDessin.setBoite(this.canvasControl.getMasterBoite());
    // Dessine.
    this.canvasDraw.drawStuff();
  }

  removeToTable(effet){
    this.canvasControl.removeToCanvas(effet);
    this.canvasDraw.drawStuff();
  }

  removeToSelection(effet){
    this.instanceDessin.removeEffet(effet);
  }

  addTextToTable(string){
    this.canvasControl.addTextToCanvas(string);
    this.canvasDraw.drawStuff();
  }

  removeTextToTable(index){
    this.canvasControl.removeTextToCanvas(index);
    this.canvasDraw.drawStuff();
  }

  /**
   * Fonction pour appeler qd on modifie un obj dans la popOver
   * @param data
   */
  dataChange(data){
    if (data.type === 'text'){
      if (data.input == undefined) data.input = ' ';
      if (data.font.size == undefined || data.font.size <= 0) data.font.size = 1;
      data.actualisePoints();
    }
    this.canvasDraw.drawStuff();
  }

  addShapeToTable(shape,color,lineWidth,fillColor){
    this.canvasControl.addShapeToCanvas({shape:shape,color:color,lineWidth:lineWidth,fillColor:fillColor});
    this.canvasDraw.drawStuff();
  }

  removeShapeToTable(index) {
    this.canvasControl.removeShapeToCanvas(index);
    this.canvasDraw.drawStuff();
  }

  addImgToTable(src){
    this.canvasControl.addImgToCanvas(src);
    //this.canvasDraw.drawStuff();
  }

  removeImgToTable(index) {
    this.canvasControl.removeImgToCanvas(index);
    this.canvasDraw.drawStuff();
  }
  ///////////////////////////////////////////////// FIN ADD & REmove EFFET et deco


  ///////////////////////////// SWITCH, Active, View State part
  /**
   * Active ou desactive le déplacement des composants.
   * Appeler par menu-dessin.html
   */
  switchDeb(){
    // Reset des obj actif et select
    this.canvasGlobalServ.resetIsSelected(this.tables.tableActive);
    this.canvasGlobalServ.resetActiveItem();

    this.canvasGlobalServ.setDeb(this.debrayable);
    this.canvasControl.resetCompPos(this.debrayable);
    if(!this.debrayable){
      this.activeEffet();
    }
  }

  /**
   * Active ou desactive le mode décoration.
   * Appeler par menu-dessin.html
   */
  switchDeco(){
    // Reset des obj actif et select
    this.canvasGlobalServ.resetIsSelected(this.tables.tableActive);
    this.canvasGlobalServ.resetActiveItem();

    // Cette ligne est pour etre sur que le .clip du canvas ne soit plus actif.
    this.canvasGlobal.canvas.canvas.width += 1;
    if (this.deco) {
      this.canvasGlobal.state.isActive = 'deco';
      this.canvasControl.canvasDrawState(this.canvasGlobal.state.isActive);
      this.switchDecoSub();
      this.canvasDraw.drawStuff();
    }
    else {
      if (this.debrayable) {
        this.canvasGlobal.state.isActive = 'composant';
        this.canvasControl.canvasDrawState(this.canvasGlobal.state.isActive);
        this.canvasDraw.drawStuff();
      }
      else {
        this.canvasGlobal.state.isActive = 'effet';
        this.canvasControl.canvasDrawState(this.canvasGlobal.state.isActive);
        this.canvasDraw.drawStuff();
      }
    }
  }

  /**
   * Met la bonne table active quand on est dans le mode
   * deco et que l'on choisit soit imgDeco, soit textDeco ...
   */
  switchDecoSub(mode){
    mode = mode || this.canvasGlobal.state.decoState;

    // Reset des obj actif et select
    this.canvasGlobalServ.resetIsSelected(this.tables.tableActive);
    this.canvasGlobalServ.resetActiveItem();

    switch(mode){
      case 'colorBox':
        this.canvasGlobalServ.setTableActive([]);
        break;
      case 'textDeco':
        this.canvasGlobalServ.setTableActive(this.canvasGlobal.boite.projBoite.textDeco);
        break;
      case 'shapeDeco':
        this.canvasGlobalServ.setTableActive(this.canvasGlobal.boite.projBoite.shapeDeco);
        break;
      case 'imgDeco':
        this.canvasGlobalServ.setTableActive(this.canvasGlobal.boite.projBoite.imgDeco);
        break;
      default :
    }
    this.canvasDraw.drawStuff();
  }

  /**
   * Appeler par menu-dessin.html
   * @todo activeEffet est appele dans plusieur endroit ou l'on ne veut
   * pas dessiner.
   */
  activeEffet(){
    // Reset des obj actif et select
    this.canvasGlobalServ.resetIsSelected(this.tables.tableActive);
    this.canvasGlobalServ.resetActiveItem();

    this.canvasGlobal.state.isActive = 'effet';
    if (this.canvasControl.canvasDrawState(this.canvasGlobal.state.isActive)) {
      this.canvasDraw.drawStuff();
    }
  }

  /**
   * Appeler par menu-dessin.html
   */
  activeCompo(){
    // Reset des obj actif et select
    this.canvasGlobalServ.resetIsSelected(this.tables.tableActive);
    this.canvasGlobalServ.resetActiveItem();

    this.canvasGlobal.state.isActive = 'composant';
    if (this.canvasControl.canvasDrawState(this.canvasGlobal.state.isActive)) {
      this.canvasDraw.drawStuff();
    }
  }

  switchViewState(string){
    this.canvasControl.canvasViewState(string);
    this.canvasControl.canvasDrawState(this.canvasGlobal.state.isActive);
    this.canvasControl.resizeCanvas();
    this.canvasControl.centerInCanvas();
    this.canvasDraw.drawStuff();
  }

  up(){
    this.switchViewState('up');
  }

  down(){
    this.switchViewState('down');
  }

  right(){
    this.switchViewState('right');
  }

  left(){
    this.switchViewState('left');
  }

  top(){
    this.switchViewState('top');
  }

  bottom(){
    this.switchViewState('bottom');
  }
  /////////////////////////// SWITCH, Active, View State part


  ///////////////////////// MOUSE on part
  // Fonction utiliser par panier-dessin
  mouseOnEffet(value){
    var effets = [];
    var effet = this.canvasGlobalServ.searchEffetById(value._id, value.key);
    if (effet) {
      switch(this.canvasGlobal.state.isActive) {
        case 'effet' :
          effets.push(effet);
          this.canvasGlobalServ.setTableDrawShine(effets);
          break;
        case 'composant' :
          this.canvasGlobalServ.setTableDrawShine(effet.composants);
          break;
        case 'boite' :
          this.canvasGlobalServ.setTableDrawShine([this.canvasGlobalServ.getProjBoite()]);
          break;
        //@todo a implementer ?
        case 'deco' :
          break;
        default:
          return console.log('Variable "isActive" not defined in pageDessin.controller.js : ' + this.canvasGlobal.state.isActive);
      }
      this.canvasDraw.drawStuff();
    }
  }

  mouseOnCompo(value){
    var compos = [];
    var compo = this.canvasGlobalServ.searchCompoById(value._id, value.key);
    if(compo) {
      compos.push(compo);
      this.canvasGlobalServ.resetTableDrawShine();
      this.canvasGlobalServ.setTableDrawShine(compos);
      this.tableDrawShine = this.canvasGlobalServ.getTableDrawShine();
      this.canvasDraw.drawStuff();
    }
  }

  mouseLeaveEffet(){
    this.canvasGlobalServ.resetTableDrawShine();
    this.canvasDraw.drawStuff();
  }
  ////////////////////// FIN MOUSE ON PART


  draw() {
    this.canvasDraw.drawStuff();
  }

  zoomAdd(value){
    this.canvasControl.zoomChange(value);
    this.canvasControl.centerInCanvas();
    this.canvasControl.resizeCanvas();
    this.canvasControl.setArrowPos();
    this.zoom = this.canvasGlobalServ.getZoom();
    this.canvasDraw.drawStuff();
  }

  rotate(value, data){
    data.rotate(value, null, this.debrayable);
    this.canvasControl.checkBorderBoxRotate(data);
    this.canvasControl.setArrowPos();
    this.canvasControl.resizeCanvas();
    this.canvasDraw.drawStuff();
  }

  // Fonction de pipette couleur appeler par modif-dessin
  eyedropper(){
    this.mouseHelper.eyedropper();
    this.canvasDraw.drawStuff();
  }

  // Utiliser par table-dessin.
  arrowChangeValue(){
    //@todo : implémenter verif collision box - effets.
    this.canvasControl.setArrowPos();
    this.canvasControl.resizeCanvas();
    this.canvasDraw.drawStuff();
  }

  //Utiliser par panier-dessin.
  updateComposant(compo, value){
    this.instanceDessin.updateComposant(compo, value);
    this.canvasControl.updateComposantInCanvas(compo);
    this.canvasDraw.drawStuff();
  }

  //@todo a supprimer.
  getTable(){
    this.toutesTables = this.canvasGlobal;
  }

}

angular.module('pedaleswitchApp')
  .component('pageDessin', {
    templateUrl: 'app/pageDessin/pageDessin.html',
    controller: PageDessinComponent
  });

})();
