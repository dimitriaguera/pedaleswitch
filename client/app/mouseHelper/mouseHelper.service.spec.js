'use strict';

describe('Service: mouseHelper', function () {

  // load the service's module
  beforeEach(module('pedalesswitchApp'));

  // instantiate service
  var mouseHelper;
  beforeEach(inject(function (_mouseHelper_) {
    mouseHelper = _mouseHelper_;
  }));

  it('should do something', function () {
    expect(!!mouseHelper).toBe(true);
  });

});
