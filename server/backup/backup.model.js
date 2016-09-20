'use strict';

import mongoose from 'mongoose';

// Importation des Models.
import Effet from '../api/effet/effet.model';
import Composant from '../api/composant/composant.model';
import TypeEffet from '../api/typeEffet/typeEffet.model';
import ComposantType from '../api/composantType/composantType.model';

import _ from 'lodash';

var fs = require('fs');
var mkdirp = require('mkdirp');
var dateFormat = require('dateformat');
var Promise = require('bluebird');

// Extraction des Schemas.
var effetSchem = Effet.schema;
var composantSchem = Composant.schema;
var effetTypeSchem = TypeEffet.schema;
var composantTypeSchem = ComposantType.schema;

// registre des collections.
var collections = [
    'effet',
    'composant',
    'typeEffet',
    'composantType'
];

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

// Creation du modele.
var Backup = mongoose.model('Backup', BackupSchema);

// Fonction de construction des data à backer.
function buildData (coll) {

    var data = {};

    return {
        store: function (key, value) {
            if (coll.indexOf(key) !== -1) {
                data[key] = value;
            }
        },
        getData: function () {
          return data;
        },
        write: function (label) {

            //return new Promise(function(resolve, reject) {
            //    fs.writeFile("<filename.type>", data, '<file-encoding>', function(err) {
            //        if (err) reject(err);
            //        else resolve(data);
            //    });
            //});


            // Date pour folder.
            var now = new Date();
            var folder = dateFormat(now, "yyyy_mm_dd__H_M_ss") + '_' + label;
            var promises = [];

            function createFolder () {
                return new Promise( (resolve, reject) => {
                    mkdirp('./server/backup/dbsave/' + folder, function (err) {
                            if ( err ) {
                                console.log( err );
                                reject( err );
                            }
                            else {
                                console.log('Directory créé');
                                resolve(true);
                            }
                    })
                });
            }

            // Creation du folder.
            promises.push(createFolder());

                    for (var prop in data) {
                        var path = './server/backup/dbsave/' + folder + '/' + prop + '.json';
                        promises.push(exportJsonFile(path, data[prop]));
                    }

            return Promise.all(promises);

        }};
};

// Fonction d'export.
function exportJsonFile (path, data) {
    return new Promise( (resolve, reject) => {
           fs.writeFile(path, JSON.stringify(data, null, 4), (err) => {
            if ( err ) {
                reject ( err );
            }
            else {
                console.log("JSON enregistré");
                resolve(true);
            }
        });
    });
}


// Exportation de la fonction de sauvegarde.
export default function (back, label) {

    return function(entity) {

        var exit = entity || true;
        var lab = label || false;

        if ( lab && typeof lab !== 'string' ) {
            lab = 'noLabel';
        }

        // Verification de l'argument back.
        if (back instanceof Array) {
            // Si ['All'] en argument, on enregistre toutes les bases.
            var backup = back.indexOf('all') !== -1 ? collections : back;
        }
        else {
            console.log('ERREUR Backup : le premier argument doit etre de type Array');
            return exit;
        }

        // On verifie la validité des arguments.
        if ( _.difference(backup, collections).length !== 0 ) {
            console.log('ERREUR Backup : les valeurs passées en argument ne correspondent pas aux collections');
            return exit;
        }

        var dataBuilder = buildData(backup);

        return Effet.find().lean().exec()
               .then( (val) => {
                    dataBuilder.store('effet', val);
                    return Composant.find().lean().exec()

                    .then( (val) => {
                        dataBuilder.store('composant', val);
                        return TypeEffet.find().lean().exec()

                        .then( (val) => {
                            dataBuilder.store('typeEffet', val);
                            return ComposantType.find().lean().exec()

                            .then( (val) => {
                                dataBuilder.store('composantType', val);
                                var data = dataBuilder.getData();
                                return Backup.create(data)

                                .then( () => {
                                    if( lab !== false ) {
                                        return dataBuilder.write(lab).then( () => {
                                            console.log('Backup et sauvegarde des JSON OK');
                                            return exit;
                                        });
                                    }
                                    else {
                                        console.log('Backup OK');
                                        return exit;
                                    }
                                });
                            });
                        });
                    });
               });
        };
};

