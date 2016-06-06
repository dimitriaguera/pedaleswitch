'use strict';
(function(){

class PageDessinComponent {
  constructor(instanceDessin, canvasConversion, canvasControl, canvasDraw, storage, $http) {
    this.dessin = {};
    this.items = {};
    this.instanceDessin = instanceDessin;
    this.canvasControl = canvasControl;
    this.canvasConversion = canvasConversion;
    this.canvasDraw = canvasDraw;
    this.storage = storage;

    // @todo peut etre on init.
    this.tableArrow = [];
    this.zoom = 0; // Overrider par le on init

    //@todo a sup verifier le oninit.
    this.$http = $http; //@todo a supp et dans la declaration aussi
    //this.effets = [];//@todo a supp
  }

  $onInit(){


    //@todo a supp et verifier dans le constructor de virer http et OrderArray.
    //this.$http.get('/api/effets').then(response => {
    //  this.effets = response.data;

      
      // if(this.instanceDessin.getDessin().options.length === 0){
      //  tis.instanceDessin.setEffet(this.effets[0], this.effets[0].options[0]);
      //  tis.instanceDessin.setEffet(this.effets[1], this.effets[1].options[0]);
      // } 

      //@todo il faut garder juste c ligne et les mettre en dehors du $http.get
      this.isActive = 'effet';
      this.debrayable = false;
      
      //@todo Sert a qqch ?
      this.zoom = 100;
      this.okZoom = true;


      this.tableArrow = this.canvasControl.getTableArrow();
      var active = this.canvasControl.getTableEffet();
      var inactive = this.canvasControl.getTableComposant();
      this.zoom = this.canvasControl.getZoom();
      this.canvasControl.setDeb(false);
      this.canvasControl.resetTableDashed();
      this.canvasControl.setTableActive(active);
      this.canvasControl.setTableThin(inactive);
      this.dessin = this.instanceDessin.getDessin();
      this.items = this.instanceDessin.getComposantItems();
      // Redessine les objets précédement présent.
      if (active.length > 0){
        this.canvasDraw.drawStuff();
      }


    //@todo a sup.
    this.toutesTables = this.canvasControl.tableState();

    //});
  }

  mouseOnEffet(value){
    var effets = [];
    var effet = this.canvasControl.searchEffetById(value._id, value.key);
    if (effet) {
      switch(this.isActive) {
        case 'effet' :
          effets.push(effet);
          this.canvasControl.setTableShine(effets);
          break;
        case 'compo' :
          this.canvasControl.setTableShine(effet.composants);
          break;
        case 'boite' :
          this.canvasControl.setTableShine([this.canvasControl.getBoite()]);
          break;
        default:
          return console.log('Variable "isActive" not defined in pageDessin.controller.js');
      }
      this.canvasDraw.drawStuff();
    }
  }

  load(){

    // Reset all Canvas.
    this.canvasControl.resetAll();

    // Recupère dans le local storage.
    var dessinStock = this.storage.get('dessin');

    this.dessin = this.instanceDessin.setDessin(dessinStock);

    // Remet les options de debrayable.
    this.debrayable = this.dessin.debrayable;
    this.switchDeb(this.debrayable);
    this.isActive = 'effet';


    this.canvasConversion.convertDessinToPixel(this.dessin);
    this.canvasControl.restoreCanvas(this.dessin);


    var active = this.canvasControl.getTableEffet();
    var inactive = this.canvasControl.getTableComposant();
    this.zoom = this.canvasControl.getZoom();
    this.canvasControl.resetTableDashed();
    this.canvasControl.setTableActive(active);
    this.canvasControl.setTableThin(inactive);
    this.items = this.instanceDessin.getComposantItems();
    this.tableArrow = this.canvasControl.getTableArrow();


    this.toutesTables = this.canvasControl.tableState();

    
    // Redessine les objets précédement présent.
    if (active.length > 0){
      this.canvasDraw.drawStuff();
    }
  }

  save(){

    // Initialise dessinStock.
    var dessinStock = JSON.parse(JSON.stringify(this.dessin));

    // Conserve l'option debrayable.
    dessinStock.debrayable = this.canvasControl.getDeb();

    // Convertie en mm.
    this.canvasConversion.convertDessinToMm(dessinStock);

    // Stock.
    this.storage.put('dessin', dessinStock);

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
  activeEffet(){
    this.isActive = 'effet';
    var active = this.canvasControl.getTableEffet();
    var inactive = this.canvasControl.getTableComposant();
    this.canvasControl.resetIsSelected(active);
    this.canvasControl.resetIsSelected(inactive);
    this.canvasControl.resetTableDashed();
    this.canvasControl.setTableActive(active);
    this.canvasControl.setTableThin(inactive);
    this.canvasDraw.drawStuff();
  }
  
  // Appeler par menu-dessin.html
  activeCompo(){
    this.isActive = 'compo';
    var active = this.canvasControl.getTableComposant();
    var inactive = this.canvasControl.getTableEffet();
    this.canvasControl.resetIsSelected(active);
    this.canvasControl.resetIsSelected(inactive);
    this.canvasControl.resetTableThin();
    this.canvasControl.setTableActive(active);
    this.canvasControl.setTableDashed(inactive);
    this.canvasDraw.drawStuff();
  }
  
  addToTable(effet){
    // Ajouter l'effet au canvas si pas deja.
    if (!effet.in_canvas) {this.canvasControl.addToCanvas(effet);}
    // Initialise le boite dans l'instance de dessin.
    this.instanceDessin.setBoite(this.canvasControl.getBoite());
    // Dessine.
    this.canvasDraw.drawStuff();
  }

  removeToTable(effet){
    this.canvasControl.removeToCanvas(effet);
    this.canvasDraw.drawStuff();
  }

  zoomAdd(value){
    this.okZoom = this.instanceDessin.zoomChange(value);
    this.canvasControl.resizeCanvasOnZoom();
    this.canvasControl.setArrowPos();
    this.zoom = this.canvasControl.getZoom();
    this.canvasDraw.drawStuff();
  }

  // Utiliser par table-dessin.
  arrowChangeValue(){
    //@todo : implémenter verif collision box - effets.
    this.canvasControl.setArrowPos();
    this.canvasDraw.drawStuff();
  }

  //Utiliser par panier-dessin.
  updateComposant(opt, compo, item){
    this.instanceDessin.updateComposant(opt, compo, item);
  }
  
  //Utiliser par panier-dessin.
  mouseOnCompo(value){
    var compos = [];
    var compo = this.canvasControl.searchCompoById(value._id, value.key);
    if(compo) {
      compos.push(compo);
      this.canvasControl.resetTableShine();
      this.canvasControl.setTableShine(compos);
      this.tableShine = this.canvasControl.getTableShine();
      this.canvasDraw.drawStuff();
    }
  }

  //Utiliser par panier-dessin.
  mouseLeaveEffet(){
    this.canvasControl.resetTableShine();
    this.canvasDraw.drawStuff();
  }
  
  //@todo a supprimer.
  getTable(){
    this.toutesTables = this.canvasControl.tableState();
    this.dessin = this.instanceDessin.getDessin();
    var x = 5;
  }

}

angular.module('pedaleswitchApp')
  .component('pageDessin', {
    templateUrl: 'app/pageDessin/pageDessin.html',
    controller: PageDessinComponent
  });

})();
