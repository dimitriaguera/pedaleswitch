'use strict';

describe('Service: canvasControl', function () {

  // load the service's module
  beforeEach(module('pedaleswitchApp'));

  // instantiate service
  var canvasControl;
  beforeEach(inject(function (_canvasControl_) {
    canvasControl = _canvasControl_;
  }));

  it('should do something', function () {
    expect(!!canvasControl).toBe(true);
  });

});
