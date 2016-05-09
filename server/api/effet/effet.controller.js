/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/effets              ->  index
 * POST    /api/effets              ->  create
 * GET     /api/effets/:id          ->  show
 * PUT     /api/effets/:id          ->  update
 * DELETE  /api/effets/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Effet from './effet.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    entity.options = [];
    for(var i=0; i<updates.options.length; i++){
      entity.options.push(updates.options[i]);
    }
    updates.options = [];
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Effets
export function index(req, res) {
  return Effet.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Effet from the DB
export function show(req, res) {
  return Effet.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Effet in the DB
export function create(req, res) {
  return Effet.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Effet in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Effet.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Effet from the DB
export function destroy(req, res) {
  return Effet.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
