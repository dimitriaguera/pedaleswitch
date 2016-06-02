'use strict';
(function(){

class PageDessinComponent {
  constructor(instanceDessin, canvasControl, canvasDraw, storage, $http) {
    this.dessin = {};
    this.items = {};
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
    /*
    //@todo a supp et verifier dans le constructor de virer http et OrderArray.
    this.$http.get('/api/effets').then(response => {
      this.effets = response.data;

      if (this.instanceDessin.getDessin().options.length === 0){
        this.instanceDessin.setEffet(this.effets[0], this.effets[0].options[0]);
        this.instanceDessin.setEffet(this.effets[1], this.effets[1].options[0]);
      }
      */

      //@todo il faut garder juste c ligne et les mettre en dehors du $http.get
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
    // Recupère dans le local storage.
    var dessinStock = this.storage.get('dessin');

    // Remplace l'intance dessin et le met dans instanceDessin
    this.dessin = this.instanceDessin.setDessin(dessinStock);

    /*
    for (i = 0 ; i < this.dessin.options.length ; i++){
      this.dessin.options[i].in_canvas = false;
      this.canvasControl.addToCanvas(this.dessin.options[i]);
    }
    */

    // Reset all Canvas.
    this.canvasControl.resetAll();
    
    // Rajoute tout les effets au canvas.
    for (i = 0 ; i < this.dessin.options.length ; i++){
      if (this.dessin.options[i].in_canvas) {
        this.dessin.options[i].in_canvas = false;
        this.canvasControl.addToCanvas(this.dessin.options[i]);
      }
    }

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

  activeBoite(){

    var tabEffet = this.canvasControl.getTableEffet();
    var tabCompo = this.canvasControl.getTableComposant();
    var tabDash = tabEffet.concat(tabCompo);

    this.isActive = 'boite';
    this.canvasControl.setTableActive([this.canvasControl.getBoite()]);
    
    this.canvasControl.resetIsSelected(tabEffet);
    this.canvasControl.resetIsSelected(tabCompo);
    this.canvasControl.resetTableThin();
    this.canvasControl.setTableDashed(tabDash);
    
    this.canvasDraw.drawStuff();
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
}

angular.module('pedaleswitchApp')
  .component('pageDessin', {
    templateUrl: 'app/pageDessin/pageDessin.html',
    controller: PageDessinComponent
  });

})();
