'use strict';
(function(){

class OptionsComponent {
  constructor() {
    this.nouvoption = false;
  }
  $onInit(){
    if(this.nouvEffet){
      this.effet.options = [{}];
      this.nouvoption = true;
    }
  }
  newOption(){
    this.effet.options.push({titre:'nouvelle option'});
    this.nouvoption = true;
  }
  deleteOption(index){
    this.effet.options.splice(index, 1);
  }
}

angular.module('pedaleswitchApp')
  .component('options', {
    templateUrl: 'app/addeffet/options/options.html',
    controller: OptionsComponent,
    bindings: {
      effet: '=',
      nouvEffet: '<'
    }
  });

})();
