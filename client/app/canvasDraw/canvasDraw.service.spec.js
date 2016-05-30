'use strict';

describe('Service: canvasDraw', function () {

  // load the service's module
  beforeEach(module('pedaleswitchApp'));

  // instantiate service
  var canvasDraw;
  beforeEach(inject(function (_canvasDraw_) {
    canvasDraw = _canvasDraw_;
  }));

  it('should do something', function () {
    expect(!!canvasDraw).toBe(true);
  });

});
