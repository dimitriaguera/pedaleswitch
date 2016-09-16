'use strict';

import mongoose from 'mongoose';

// Importation des Models.
import Effet from '../api/effet/effet.model';
import Composant from '../api/composant/composant.model';
import TypeEffet from '../api/typeEffet/typeEffet.model';
import ComposantType from '../api/composantType/composantType.model';

// Extraction des Schemas.
var effetSchem = Effet.schema;
var composantSchem = Composant.schema;
var effetTypeSchem = TypeEffet.schema;
var composantTypeSchem = ComposantType.schema;

// Creation du Schema.
var BackupSchema = new mongoose.Schema({
  d: {
    type: Date,
    default: Date.now
  },
  effet: [effetSchem],
  typeEffet: [effetTypeSchem],
  composant: [composantSchem],
  composantType: [composantTypeSchem]
});

// Fonction d'erreur.
function handleError(statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
  };
}

// Creation du modele.
var Backup = mongoose.model('Backup', BackupSchema);

// Exportation de la fonction de sauvegarde.
export default function (back, id) {

    var backup = back || [];

    Effet.find().lean().exec()
        .then(effet => {
      return Composant.find().lean().exec()
          .then(composant => {
        return TypeEffet.find().lean().exec()
            .then(typeEff => {
          return ComposantType.find().lean().exec()
              .then(typeComp => {
            return Backup.create({
                effet: backup.indexOf('effet') === -1 ? [] : effet,
                composant: backup.indexOf('composant') === -1 ? [] : composant,
                typeEffet: backup.indexOf('typeEffet') === -1 ? [] : typeEff,
                composantType: backup.indexOf('composantType') === -1 ? [] : typeComp
                })
                .then( em => {
                return TypeEffet.findById(id).exec()
                    .then(entity => {
                    console.log(entity);
                    return entity;
                     });

                });
                });
           });
          });
        });
};


