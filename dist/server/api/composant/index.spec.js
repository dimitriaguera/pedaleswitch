'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var composantCtrlStub = {
  index: 'composantCtrl.index',
  show: 'composantCtrl.show',
  create: 'composantCtrl.create',
  update: 'composantCtrl.update',
  destroy: 'composantCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var composantIndex = proxyquire('./index.js', {
  'express': {
    Router: function Router() {
      return routerStub;
    }
  },
  './composant.controller': composantCtrlStub
});

describe('Composant API Router:', function () {

  it('should return an express router instance', function () {
    composantIndex.should.equal(routerStub);
  });

  describe('GET /api/composants', function () {

    it('should route to composant.controller.index', function () {
      routerStub.get.withArgs('/', 'composantCtrl.index').should.have.been.calledOnce;
    });
  });

  describe('GET /api/composants/:id', function () {

    it('should route to composant.controller.show', function () {
      routerStub.get.withArgs('/:id', 'composantCtrl.show').should.have.been.calledOnce;
    });
  });

  describe('POST /api/composants', function () {

    it('should route to composant.controller.create', function () {
      routerStub.post.withArgs('/', 'composantCtrl.create').should.have.been.calledOnce;
    });
  });

  describe('PUT /api/composants/:id', function () {

    it('should route to composant.controller.update', function () {
      routerStub.put.withArgs('/:id', 'composantCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/composants/:id', function () {

    it('should route to composant.controller.update', function () {
      routerStub.patch.withArgs('/:id', 'composantCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/composants/:id', function () {

    it('should route to composant.controller.destroy', function () {
      routerStub.delete.withArgs('/:id', 'composantCtrl.destroy').should.have.been.calledOnce;
    });
  });
});
//# sourceMappingURL=index.spec.js.map
