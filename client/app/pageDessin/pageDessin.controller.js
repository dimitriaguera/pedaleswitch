'use strict';
(function(){

class PageDessinComponent {
  constructor(instanceDessin, canvasControl) {
    this.dessin = {};
    this.items = {};
    this.instanceDessin = instanceDessin;
    this.canvasControl = canvasControl;
    this.isActive = 'effet';
    this.activeTable = [];
    this.tableCompo = [];
  }

  $onInit(){
    var active = this.canvasControl.getTableEffet();
    var inactive = this.canvasControl.getTableComposant();
    this.canvasControl.setDeb(false);
    this.canvasControl.resetTableDashed();
    this.canvasControl.setTableActive(active);
    this.canvasControl.setTableThin(inactive);
    this.dessin = this.instanceDessin.getDessin();
    this.items = this.instanceDessin.getComposantItems();
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
    this.activeTable = this.canvasControl.getTableActive();
    this.tableCompo = this.canvasControl.getTableComposant();
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
}

angular.module('pedaleswitchApp')
  .component('pageDessin', {
    templateUrl: 'app/pageDessin/pageDessin.html',
    controller: PageDessinComponent
  });

})();
