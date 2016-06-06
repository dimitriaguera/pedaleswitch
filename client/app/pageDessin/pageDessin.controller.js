'use strict';
(function(){

class PageDessinComponent {
  constructor(instanceDessin, canvasControl, canvasDraw, storage, $http) {
    this.dessin = {};
    this.items = {};
    this.activeItem = [];
    this.instanceDessin = instanceDessin;
    this.canvasControl = canvasControl;
    this.canvasDraw = canvasDraw;
    this.storage = storage;
    this.isActive = 'effet';
    this.zoom = 100;
    this.okZoom = true;

    
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
      this.activeItem = this.canvasControl.getActiveItem();
      // Redessine les objets précédement présent.
      if (active.length > 0){
        this.canvasDraw.drawStuff();
      }

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
    var i;

    // Reset all Canvas.
    this.canvasControl.resetAll();

    // Recupère dans le local storage.
    var dessinStock = this.storage.get('dessin');

    // Regénère la boite.
    this.dessin.boite = this.canvasControl.newBoite(dessinStock.boite);

    // Rajoute tout les effets au canvas.
    //@todo addToCanvas with load option car on peut pas faire incanvas...
    for (i = 0 ; i < dessinStock.options.length ; i++){
        this.canvasControl.addToCanvas(dessinStock.options[i], true);
    }

    // Passe par reference la table d'effet a l'instance dessin.
    this.dessin.options = this.canvasControl.getTableEffet();

    this.toutesTables = this.canvasControl.tableState();

    var active = this.canvasControl.getTableEffet();
    var inactive = this.canvasControl.getTableComposant();
    this.zoom = this.canvasControl.getZoom();
    this.canvasControl.setDeb(false);
    this.canvasControl.resetTableDashed();
    this.canvasControl.setTableActive(active);
    this.canvasControl.setTableThin(inactive);
    this.items = this.instanceDessin.getComposantItems();
    
    
    // Redessine les objets précédement présent.
    if (active.length > 0){
      this.canvasDraw.drawStuff();
    }
    
    
  }

  save(){
    this.storage.put('dessin', this.dessin);
    
  }

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

  mouseLeaveEffet(){
    this.canvasControl.resetTableShine();
    this.canvasDraw.drawStuff();
  }

  switchDeb(value){
    this.canvasControl.setDeb(value);
    this.canvasControl.resetCompPos(value);
    this.canvasDraw.drawStuff();
    if(!value){
      this.activeEffet();
      this.canvasDraw.drawStuff();
    }
  }
  
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

  updateComposant(opt, compo, item){
    this.instanceDessin.updateComposant(opt, compo, item);
  }

  addToTable(effet){
    // Ajouter l'effet au canvas si pas deja.
    if (!effet.in_canvas) {this.canvasControl.addToCanvas(effet);}
    // Initialise le boite dans l'instance de dessin.
    this.instanceDessin.setBoite(this.canvasControl.getBoite());
    // Dessine.
    this.canvasDraw.drawStuff();
    //@todo a sup sert au dev.
    this.toutesTables = this.canvasControl.tableState();
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

  arrowChangeValue(){
    //@todo : implémenter verif collision box - effets.
    this.canvasControl.setArrowPos();
    this.canvasDraw.drawStuff();
  }

}

angular.module('pedaleswitchApp')
  .component('pageDessin', {
    templateUrl: 'app/pageDessin/pageDessin.html',
    controller: PageDessinComponent
  });

})();
