/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/composantTypes              ->  index
 * POST    /api/composantTypes              ->  create
 * GET     /api/composantTypes/:id          ->  show
 * PUT     /api/composantTypes/:id          ->  update
 * DELETE  /api/composantTypes/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import ComposantType from './composantType.model';
import Composant from '../composant/composant.model';
import Effet from '../effet/effet.model';
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
      .then(updated => {
        return updated;
      });
  };
}

function updateInEffet (req, res) {

  return function (entity) {

    var query = Effet.find({});

    query.where('options').elemMatch(function (opt) {
      opt.where('composants').elemMatch(function (comp) {
        comp.where('type', entity.titre)

      });
    });

    var cursor = query.cursor();
    var titre = entity.titre;
    var newTitre = req.body.titre;

      function operate (data) {
          var o = data.options.length;
          for ( var j = 0; j < o; j++ ){
              var c = data.options[j].composants.length;
              for ( var k = 0; k < c; k++ ){
                  var composant = data.options[j].composants[k];
                  if (composant.type === titre) {
                      composant.type = newTitre;
                  }
              }
          }
          return data.save().then( (val) => {
              console.log('Mise à jour réussie de l\'effet : ' + val.titre);
              return val;
      });
      }

      return cursor.eachAsync(operate, function(){
          console.log('Mise à jour des effets réussie.');
      }).then( () => {
              return entity;
      });

  }
}

function updateInComposant (req) {
    return function (entity) {
        return Composant.update({type: entity.titre}, {type: req.body.titre}, {multi: true})
            .then( () => {
                console.log('Composants updatés: OK');
                return entity;
            });
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
    res.status(statusCode).send(err);
  };
}

// Gets a list of ComposantTypes
export function index(req, res) {
  return ComposantType.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single ComposantType from the DB
export function show(req, res) {
  return ComposantType.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new ComposantType in the DB
export function create(req, res) {
  console.log(req.body);
  return ComposantType.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing ComposantType in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return ComposantType.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(backUpAll(['effet', 'composant', 'composantType'], 'typeCompoChange'))
    .then(updateInEffet(req, res))
    .then(updateInComposant(req))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a ComposantType from the DB
export function destroy(req, res) {
  return ComposantType.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
