'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var cacheCtrlStub = {
  index: 'cacheCtrl.index',
  show: 'cacheCtrl.show',
  create: 'cacheCtrl.create',
  update: 'cacheCtrl.update',
  destroy: 'cacheCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var cacheIndex = proxyquire('./index.js', {
  'express': {
    Router: function Router() {
      return routerStub;
    }
  },
  './cache.controller': cacheCtrlStub
});

describe('Cache API Router:', function () {

  it('should return an express router instance', function () {
    cacheIndex.should.equal(routerStub);
  });

  describe('GET /api/caches', function () {

    it('should route to cache.controller.index', function () {
      routerStub.get.withArgs('/', 'cacheCtrl.index').should.have.been.calledOnce;
    });
  });

  describe('GET /api/caches/:id', function () {

    it('should route to cache.controller.show', function () {
      routerStub.get.withArgs('/:id', 'cacheCtrl.show').should.have.been.calledOnce;
    });
  });

  describe('POST /api/caches', function () {

    it('should route to cache.controller.create', function () {
      routerStub.post.withArgs('/', 'cacheCtrl.create').should.have.been.calledOnce;
    });
  });

  describe('PUT /api/caches/:id', function () {

    it('should route to cache.controller.update', function () {
      routerStub.put.withArgs('/:id', 'cacheCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/caches/:id', function () {

    it('should route to cache.controller.update', function () {
      routerStub.patch.withArgs('/:id', 'cacheCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/caches/:id', function () {

    it('should route to cache.controller.destroy', function () {
      routerStub.delete.withArgs('/:id', 'cacheCtrl.destroy').should.have.been.calledOnce;
    });
  });
});
//# sourceMappingURL=index.spec.js.map
