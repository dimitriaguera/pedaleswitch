'use strict';
(function(){

class OptionsComponent {
  constructor() {
    this.message = 'Hello';
    this.indexOptions = [];
  }
}

angular.module('pedaleswitchApp')
  .component('options', {
    templateUrl: 'app/addeffet/options/options.html',
    controller: OptionsComponent,
    bindings: {
      optionsEffet: '=',
      nouvEffet: '='
    },
  });

})();
