'use strict';

describe('Service: dataPrepar', function () {

  // load the service's module
  beforeEach(module('pedaleswitchApp'));

  // instantiate service
  var dataPrepar;
  beforeEach(inject(function (_dataPrepar_) {
    dataPrepar = _dataPrepar_;
  }));

  it('should do something', function () {
    expect(!!dataPrepar).toBe(true);
  });

});
