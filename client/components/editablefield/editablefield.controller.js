'use strict';
(function(){

  class EditableField {
    constructor() {
      this.editMode = false;
      this.fieldValueCopy = '';
    }

    $onInit() {
      this.fieldValueCopy = this.fieldValue;
    // Set a default fieldType
      if (!this.fieldType) {
        this.fieldType = 'text';
      }
    }

    handleModeChange() {
      if (this.editMode && (this.fieldValue !== this.fieldValueCopy)) {
        this.onUpdate({value: this.fieldValue});
      }
      this.editMode = !this.editMode;
    }
  }

  angular.module('pedaleswitchApp')
    .component('editablefield', {
      templateUrl: 'components/editablefield/editablefield.html',
      bindings: {
        fieldValue: '<',
        fieldType: '@?',
        onUpdate: '&',
      },
      controller: EditableField,
    });

})();
