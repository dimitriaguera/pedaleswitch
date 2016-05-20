'use strict';
(function(){

class PageDessinComponent {
  constructor(instanceDessin, canvasControl) {
    this.dessin = {};
    this.items = {};
    this.instanceDessin = instanceDessin;
    this.canvasControl = canvasControl;
    this.activeTable = [];
  }

  $onInit(){
    this.dessin = this.instanceDessin.getDessin();
    this.items = this.instanceDessin.getComposantItems();
    this.activeTable = this.canvasControl.getTableEffet();
    this.tableCompo = this.canvasControl.getTableComposant();
  }

  updateComposant(opt, compo, item){
    this.instanceDessin.updateComposant(opt, compo, item);
  }

  addToTable(value){
    this.canvasControl.addToCanvas(value);
    this.canvasControl.drawStuff(this.activeTable);
  }
}

angular.module('pedaleswitchApp')
  .component('pageDessin', {
    templateUrl: 'app/pageDessin/pageDessin.html',
    controller: PageDessinComponent
  });

})();
