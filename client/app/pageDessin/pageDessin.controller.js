'use strict';
(function(){

class PageDessinComponent {
  constructor(instanceDessin, canvasControl, $http) {
    this.dessin = {};
    this.items = {};
    this.instanceDessin = instanceDessin;
    this.canvasControl = canvasControl;
    this.isActive = 'effet';

    
    //@todo a sup verifier le oninit.
    this.$http = $http; //@todo a supp et dans la declaration aussi
    this.effets = [];//@todo a supp
  }

  $onInit(){
    //@todo a supp et verifier dans le constructor de virer http et OrderArray.
    this.$http.get('/api/effets').then(response => {
      this.effets = response.data;
      this.instanceDessin.setEffet(this.effets[0], this.effets[0].options[0]);
      //this.instanceDessin.setEffet(this.effets[1], this.effets[1].options[0]);


      //@todo il faut garder juste c ligne et les mettre en dehors du $http.get
      var active = this.canvasControl.getTableEffet();
      var inactive = this.canvasControl.getTableComposant();
      this.canvasControl.setDeb(false);
      this.canvasControl.resetTableDashed();
      this.canvasControl.setTableActive(active);
      this.canvasControl.setTableThin(inactive);
      this.dessin = this.instanceDessin.getDessin();
      this.items = this.instanceDessin.getComposantItems();
    });
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
        default:
          return console.log('Variable "isActive" not defined in pageDessin.controller.js');
      }
      this.canvasControl.drawStuff();
    }
  }

  mouseOnCompo(value){
    var compos = [];
    var compo = this.canvasControl.searchCompoById(value._id, value.key);
    if(compo) {
      compos.push(compo);
      this.canvasControl.resetTableShine();
      this.canvasControl.setTableShine(compos);
      this.tableShine = this.canvasControl.getTableShine();
      this.canvasControl.drawStuff();
    }
  }

  mouseLeaveEffet(){
    this.canvasControl.resetTableShine();
    this.canvasControl.drawStuff();
  }

  switchDeb(value){
    this.canvasControl.setDeb(value);
    this.canvasControl.resetCompPos(value);
    if(!value){
      this.activeEffet();
    }
  }

  activeEffet(){
    this.isActive = 'effet';
    var active = this.canvasControl.getTableEffet();
    var inactive = this.canvasControl.getTableComposant();
    this.canvasControl.resetTableDashed();
    this.canvasControl.setTableActive(active);
    this.canvasControl.setTableThin(inactive);
    this.canvasControl.drawStuff();
  }

  activeCompo(){
    this.isActive = 'compo';
    var active = this.canvasControl.getTableComposant();
    var inactive = this.canvasControl.getTableEffet();
    this.canvasControl.resetTableThin();
    this.canvasControl.setTableActive(active);
    this.canvasControl.setTableDashed(inactive);
    this.canvasControl.drawStuff();
  }

  updateComposant(opt, compo, item){
    this.instanceDessin.updateComposant(opt, compo, item);
  }

  addToTable(value){
    this.canvasControl.addToCanvas(value);
    this.canvasControl.drawStuff();
  }

  removeToTable(value){
    this.canvasControl.removeToCanvas(value);
    this.canvasControl.drawStuff();
  }
  
  
}

angular.module('pedaleswitchApp')
  .component('pageDessin', {
    templateUrl: 'app/pageDessin/pageDessin.html',
    controller: PageDessinComponent
  });

})();
