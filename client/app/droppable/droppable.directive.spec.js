'use strict';

describe('Directive: droppable', function () {

  // load the directive's module and view
  beforeEach(module('pedaleswitchApp'));
  beforeEach(module('app/droppable/droppable.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<droppable></droppable>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the droppable directive');
  }));
});
