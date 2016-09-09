'use strict';

describe('Directive: showErrors', function () {

  // load the directive's module
  beforeEach(module('showErrors'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<show-errors></show-errors>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the showErrors directive');
  }));
});
