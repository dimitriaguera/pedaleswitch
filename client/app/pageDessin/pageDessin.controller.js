'use strict';
(function(){

class PageDessinComponent {

  constructor(instanceDessin, canvasConversion, canvasControl, canvasDraw, storage, $http, mouseHelper, $timeout) {
    this.$timeout = $timeout;
    this.instanceDessin = instanceDessin;
    this.canvasControl = canvasControl;
    this.canvasConversion = canvasConversion;
    this.canvasDraw = canvasDraw;
    this.storage = storage;
    
    //@todo a sup verifier le oninit.
    this.mouseHelper = mouseHelper;
    this.$http = $http; //@todo a supp et dans la declaration aussi
  }

  // Object passé aux componants box-dessin.
  // Permet de binder des fonctions.
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
    changeFont: function(font, data){
      var self2 = this.self;
      data.font.family = font.stack;
      self2.$timeout(
        function(){
          self2.dataChange(data);
        },
        300
      );
    }
  };

  $onInit(){
    //@todo a supp et verifier dans le constructor de virer http et OrderArray.
    this.$http.get('/api/effets').then(response => {
      this.effets = response.data;
       if(this.instanceDessin.getDessin().options.length === 0){
        this.instanceDessin.setEffet(this.effets[0], this.effets[0].options[0]);
    //    this.instanceDessin.setEffet(this.effets[1], this.effets[1].options[0]);
       }
    })
    this.initialisation();
  }

  initialisation() {
    // Link les tables.
    this.items = this.instanceDessin.getComposantItems();
    this.dessin = this.instanceDessin.getDessin();
    this.tableArrow = this.canvasControl.getTableArrow();
    this.tableText = this.canvasControl.getTableText();
    this.activeItem = this.canvasControl.getActiveItem();
    
    // Met les bonnes options.
    this.canvasSetting = this.canvasControl.getCanvasSetting();
    this.zoom = this.canvasControl.getZoom();
    this.debrayable = this.canvasSetting.debrayable;
    this.deco = false;

    // Active les effets et les dessines.
    this.activeEffet();

    // Ce bout a été deplacer dans table-dessin controleur car
    // a cet instant rien ne dis que le canvas est pret dans le dom
    // donc inefficace.
    // Check canvas size.
    //this.canvasControl.resizeCanvas();

    //@todo a sup.
    this.toutesTables = this.canvasControl.tableState();
  }


  load(){
    // Reset all Canvas.
    this.canvasControl.resetAll();
    // Recupère dans le local storage.
    var dessinStock = this.storage.get('dessin');
    // Instancie le dessin et le stock dans this.dessin.
    this.dessin = this.instanceDessin.setDessin(dessinStock);
    // Convertie les mM en pixel.
    this.canvasConversion.convertDessinToPixel(this.dessin);
    // Rajouter les things et la boite dans le canvas.
    this.canvasControl.restoreCanvas(this.dessin);
    // Remet les options de debrayable.
    this.debrayable = this.dessin.debrayable;
    this.switchDeb(this.debrayable);
    // Link la tableau arrow.
    this.tableArrow = this.canvasControl.getTableArrow();
    // Active la table effet et dessine.
    this.activeEffet();
  }

  save(){

    // Convertie en mm.
    this.canvasConversion.convertDessinToMm(this.dessin);

    // Initialise dessinStock.
    var dessinStock = JSON.parse(JSON.stringify(this.dessin));

    // Convertie en pixel.
    this.canvasConversion.convertDessinToPixel(this.dessin);

    // Conserve l'option debrayable.
    dessinStock.debrayable = this.canvasSetting.debrayable;
    // Stock.
    this.storage.put('dessin', dessinStock);
  }

  mouseOnEffet(value){
    var effets = [];
    var effet = this.canvasControl.searchEffetById(value._id, value.key);
    if (effet) {
      switch(this.isActive) {
        case 'effet' :
          effets.push(effet);
          this.canvasControl.setTableDrawShine(effets);
          break;
        case 'composant' :
          this.canvasControl.setTableDrawShine(effet.composants);
          break;
        case 'boite' :
          this.canvasControl.setTableDrawShine([this.canvasControl.getBoite()]);
          break;
        //@todo a implementer ?
        case 'deco' :
          break;
        default:
          return console.log('Variable "isActive" not defined in pageDessin.controller.js : ' + this.isActive);
      }
      this.canvasDraw.drawStuff();
    }
  }
    
  // Appeler par menu-dessin.html
  switchDeb(){
    this.canvasControl.setDeb(this.debrayable);
    this.canvasControl.resetCompPos(this.debrayable);
    if(!this.debrayable){
      this.activeEffet();
    }
  }

  // Appeler par menu-dessin.html
  switchDeco(){
    if (this.deco) {
      this.isActive = 'deco';
      this.canvasControl.canvasDrawState('deco');
      this.canvasDraw.drawStuff();
    }
    else {
      if (this.debrayable) {
        this.isActive = 'composant';
        this.canvasControl.canvasDrawState(this.isActive);
        this.canvasDraw.drawStuff();
      }
      else {
        this.isActive = 'effet';
        this.canvasControl.canvasDrawState(this.isActive);
        this.canvasDraw.drawStuff();
      }
    }
  }

  // Appeler par menu-dessin.html
  // @todo activeEffet est appele dans plusieur endroit ou l'on ne veut
  // pas dessiner.
  activeEffet(){
    this.isActive = 'effet';
    var notEmpty = this.canvasControl.canvasDrawState('effet');
    if (notEmpty) {
      this.canvasDraw.drawStuff();
    }
  }
  
  // Appeler par menu-dessin.html
  activeCompo(){
    this.isActive = 'composant';
    var notEmpty = this.canvasControl.canvasDrawState('composant');
    if (notEmpty) {
      this.canvasDraw.drawStuff();
    }
  }
  
  // Rajoute un effet au canvas
  // Appeler par panier dessin et quand on droppable directive
  addToTable(effet){
    // Ajouter l'effet au canvas si pas deja.
    if (!effet.inCanvas) {this.canvasControl.addToCanvas(effet);}
    // Initialise le boite dans l'instance de dessin.
    this.instanceDessin.setBoite(this.canvasControl.getMasterBoite());
    // Dessine.
    this.canvasDraw.drawStuff();
  }

  addTextToTable(string){
    this.canvasControl.addTextToCanvas(string);
    this.canvasDraw.drawStuff();
  }

  dataChange(data){
    var x;
    x = 4;
    if (data.input == undefined) data.input = ' ';
    if (data.font.size == undefined || data.font.size <= 0) data.font.size = 1;
    this.canvasControl.actualisePoints(data);
    this.canvasDraw.drawStuff();
  }
  
  removeToTable(effet){
    this.canvasControl.removeToCanvas(effet);
    this.canvasDraw.drawStuff();
  }

  zoomAdd(value){
    this.instanceDessin.zoomChange(value);
    this.canvasControl.centerInCanvas();
    this.canvasControl.resizeCanvas();
    this.canvasControl.setArrowPos();
    this.zoom = this.canvasControl.getZoom();
    this.canvasDraw.drawStuff();
  }

  up(){
    this.canvasControl.canvasViewState('up');
    this.canvasControl.canvasDrawState(this.isActive);
    this.canvasControl.resizeCanvas();
    this.canvasDraw.drawStuff();
  }

  down(){
    this.canvasControl.canvasViewState('down');
    this.canvasControl.canvasDrawState(this.isActive);
    this.canvasControl.resizeCanvas();
    this.canvasDraw.drawStuff();
  }

  right(){
    this.canvasControl.canvasViewState('right');
    this.canvasControl.canvasDrawState(this.isActive);
    this.canvasControl.resizeCanvas();
    this.canvasDraw.drawStuff();
  }

  left(){
    this.canvasControl.canvasViewState('left');
    this.canvasControl.canvasDrawState(this.isActive);
    this.canvasControl.resizeCanvas();
    this.canvasDraw.drawStuff();
  }

  top(){
    this.canvasControl.canvasViewState('top');
    this.canvasControl.canvasDrawState(this.isActive);
    this.canvasControl.resizeCanvas();
    this.canvasDraw.drawStuff();
  }

  bottom(){
    this.canvasControl.canvasViewState('bottom');
    this.canvasControl.canvasDrawState(this.isActive);
    this.canvasControl.resizeCanvas();
    this.canvasDraw.drawStuff();
  }


  // @todo : implémenter quand on tourne
  // pret bord canvas. Les composants se deplace.
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
  
  //Utiliser par panier-dessin.
  mouseOnCompo(value){
    var compos = [];
    var compo = this.canvasControl.searchCompoById(value._id, value.key);
    if(compo) {
      compos.push(compo);
      this.canvasControl.resetTableDrawShine();
      this.canvasControl.setTableDrawShine(compos);
      this.tableDrawShine = this.canvasControl.getTableDrawShine();
      this.canvasDraw.drawStuff();
    }
  }

  //Utiliser par panier-dessin.
  mouseLeaveEffet(){
    this.canvasControl.resetTableDrawShine();
    this.canvasDraw.drawStuff();
  }
  
  //@todo a supprimer.
  getTable(){
    this.toutesTables = [this.canvasControl.tableState() , this.instanceDessin.getDessin()];
  }
}

angular.module('pedaleswitchApp')
  .component('pageDessin', {
    templateUrl: 'app/pageDessin/pageDessin.html',
    controller: PageDessinComponent
  });

})();
