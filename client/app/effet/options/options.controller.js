'use strict';
(function(){

class OptionsComponent {
  constructor($scope) {
    this.nouvoption = false;
  }
  $onInit(){
    if(this.nouvEffet){
      this.effet.options = [{
        disponibilite:'enStock',
        publie: false,
        composants: [{
          titre:'A définir'
        }]
      }];
      this.nouvoption = true;
    }
  }
  newOption(){
    this.effet.options.push({
      titre:'nouvelle option',
      disponibilite:'enStock',
      publie: false,
      composants: [{
        titre:'A définir'
      }]
    });
    this.nouvoption = true;
  }
  deleteOption(index){
    this.effet.options.splice(index, 1);
  }
}

angular.module('pedaleswitchApp')
  .component('options', {
    templateUrl: 'app/effet/options/options.html',
    controller: OptionsComponent,
    bindings: {
      effet: '=',
      nouvEffet: '<'
    }
  });

})();
