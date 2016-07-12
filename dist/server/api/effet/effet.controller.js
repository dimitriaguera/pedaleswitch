/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/effets              ->  index
 * POST    /api/effets              ->  create
 * GET     /api/effets/:id          ->  show
 * PUT     /api/effets/:id          ->  update
 * DELETE  /api/effets/:id          ->  destroy
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

var _effet = require('./effet.model');

var _effet2 = _interopRequireDefault(_effet);

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
    entity.options = [];
    for (var i = 0; i < updates.options.length; i++) {
      entity.options.push(updates.options[i]);
    }
    updates.options = [];
    var updated = _lodash2.default.merge(entity, updates);
    return updated.save().then(function (updated) {
      return updated;
    });
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
    res.status(statusCode).send(err);
  };
}

// Gets a list of Effets
function index(req, res) {
  return _effet2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single Effet from the DB
function show(req, res) {
  return _effet2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new Effet in the DB
function create(req, res) {
  return _effet2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Updates an existing Effet in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _effet2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a Effet from the DB
function destroy(req, res) {
  return _effet2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}
//# sourceMappingURL=effet.controller.js.map
