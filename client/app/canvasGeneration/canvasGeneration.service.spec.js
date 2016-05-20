'use strict';

describe('Service: canvasGeneration', function () {

  // load the service's module
  beforeEach(module('pedaleswitchApp'));

  // instantiate service
  var canvasGeneration;
  beforeEach(inject(function (_canvasGeneration_) {
    canvasGeneration = _canvasGeneration_;
  }));

  it('should do something', function () {
    expect(!!canvasGeneration).toBe(true);
  });

});
