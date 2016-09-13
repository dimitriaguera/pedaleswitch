'use strict';

describe('Directive: validationModal', function () {

  // load the directive's module
  beforeEach(module('pedaleswitchApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<validation-modal></validation-modal>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the validationModal directive');
  }));
});
