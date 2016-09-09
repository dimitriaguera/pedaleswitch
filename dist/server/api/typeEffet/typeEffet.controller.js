/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/typeEffets              ->  index
 * POST    /api/typeEffets              ->  create
 * GET     /api/typeEffets/:id          ->  show
 * PUT     /api/typeEffets/:id          ->  update
 * DELETE  /api/typeEffets/:id          ->  destroy
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = index;
exports.show = show;
exports.create = create;
exports.update = update;
exports.destroy = destroy;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _typeEffet = require('./typeEffet.model');

var _typeEffet2 = _interopRequireDefault(_typeEffet);

var _effet = require('../effet/effet.model');

var _effet2 = _interopRequireDefault(_effet);

var _cache = require('../cache/cache.model');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _lodash2.default.merge(entity, updates);
    return updated.save().then(function (updated) {
      return updated;
    });
  };
}

// Save in cache.
function saveInCache(req) {
  return function (entity) {
    if (entity && req.body.titre !== '') {
      console.log('Type effet chargé : OK');
      return _effet2.default.find().lean().exec().then(function (data) {
        console.log('Base effets trouvée : OK');
        return _cache2.default.remove({}).then(function (en) {
          console.log('Cache supprimé: OK');
          return _cache2.default.create(data).then(function (en) {
            console.log('Effets mis en cache: OK');
            return _cache2.default.update({ type: entity.titre }, { type: req.body.titre }, { multi: true }).then(function (en) {
              console.log('Cache updaté: OK');
              return _effet2.default.remove({}).then(function (en) {
                console.log('Base Effets effacée: OK');
                return _cache2.default.find().lean().exec().then(function (fromCache) {
                  console.log('Chargement du nouveau cache: OK');
                  return _effet2.default.create(fromCache).then(function (en) {
                    console.log('Base effet réinjectée depuis le cache: OK');
                    return _typeEffet2.default.findById(req.params.id).exec().then(function (entity) {
                      console.log('Debut de changement type effet: OK');
                      return entity;
                    });
                  });
                });
              });
            });
          });
        });
      });
    } else {
      console.log('Aucune entité trouvée ou nouveau type vide');
      return null;
    }
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove().then(function () {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    console.log('Handle error: ->' + err);
    res.status(statusCode).send(err);
  };
}

// Gets a list of TypeEffets
function index(req, res) {
  return _typeEffet2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single TypeEffet from the DB
function show(req, res) {
  return _typeEffet2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new TypeEffet in the DB
function create(req, res) {
  return _typeEffet2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Updates an existing TypeEffet in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  _typeEffet2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(saveInCache(req)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a TypeEffet from the DB
function destroy(req, res) {
  return _typeEffet2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}
//# sourceMappingURL=typeEffet.controller.js.map
