/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/composants              ->  index
 * POST    /api/composants              ->  create
 * GET     /api/composants/:id          ->  show
 * PUT     /api/composants/:id          ->  update
 * DELETE  /api/composants/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Composant from './composant.model';



// Creates a new Composant in the DB
export function create(req, res) {
  return Composant.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}


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

// Gets a list of Composants
export function index(req, res) {
  return Composant.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Composant from the DB
export function show(req, res) {
  return Composant.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}



// Updates an existing Composant in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Composant.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Composant from the DB
export function destroy(req, res) {
  return Composant.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
