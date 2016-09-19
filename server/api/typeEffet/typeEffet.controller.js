/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/typeEffets              ->  index
 * POST    /api/typeEffets              ->  create
 * GET     /api/typeEffets/:id          ->  show
 * PUT     /api/typeEffets/:id          ->  update
 * DELETE  /api/typeEffets/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import TypeEffet from './typeEffet.model';
import Effet from '../effet/effet.model';
import Cache from '../cache/cache.model';
import backUpAll from '../../backup/backup.model';

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
      .then( (updated) => {
        return updated;
      });
  };
}

// Save in cache.
function saveInCache(req) {

  return function(entity) {
    if (entity && (req.body.titre !== '')) {
      console.log('Type effet chargé : OK');
      return Effet.find().lean().exec()
          .then( (data) => {
             console.log('Base effets trouvée : OK');
             return Cache.remove({})
             .then( () => {
                  console.log('Cache supprimé: OK');
                  return Cache.create(data)
                  .then( () => {
                        console.log('Effets mis en cache: OK');
                        return Cache.update({type: entity.titre}, {type: req.body.titre}, {multi: true})
                        .then( () => {
                              console.log('Cache updaté: OK');
                              return Effet.remove({})
                              .then( () => {
                                    console.log('Base Effets effacée: OK');
                                    return Cache.find().lean().exec()
                                    .then( (fromCache) => {
                                          console.log('Chargement du nouveau cache: OK');
                                          return Effet.create(fromCache)
                                          .then( () => {
                                                console.log('Base effet réinjectée depuis le cache: OK');
                                                return entity;
                                          });
                                    });
                              });
                        });
                  });
             });
          });
      }
      else {
          console.log('Aucune entité trouvée ou nouveau type vide');
      return null;
    }
  }
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
    console.log('Handle error: ->' + err);
    res.status(statusCode).send(err);
  };
}

// Gets a list of TypeEffets
export function index(req, res) {
  return TypeEffet.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single TypeEffet from the DB
export function show(req, res) {
  return TypeEffet.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new TypeEffet in the DB
export function create(req, res) {
  return TypeEffet.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}


// Updates an existing TypeEffet in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  };
  TypeEffet.findById(req.params.id).exec()
      .then(handleEntityNotFound(res))
      .then(backUpAll(['effet', 'typeEffet'], true))
      .then(saveInCache(req))
      .then(saveUpdates(req.body))
      .then(respondWithResult(res))
      .catch(handleError(res));
}

// Deletes a TypeEffet from the DB
export function destroy(req, res) {
  return TypeEffet.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
