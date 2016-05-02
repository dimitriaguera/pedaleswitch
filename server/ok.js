;
'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pedaleswitch-dev');


var db = mongoose.connection;

var ComposantSchema = new mongoose.Schema({
  titre: String,
  type: String,
  description: String,
  disponible: Boolean,
  prix_additionnel: Number,
  dimensions: {x:Number, y:Number},
  media: []
});
var Composant = mongoose.model('Composant', ComposantSchema);


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', callopen);


function callopen(){
  // update juste le premeir champs.
  //Composant.findOneAndUpdate({ disponible: false }, { disponible: true } , calltest);

  //.where({name: /^t/})


  // Modifie tout les champs.
  Composant.where({ disponible: false })
    .setOptions({ multi: true})
    .update({ disponible: true }, calltest );

  return;
}

function calltest(err, results) {
  if (err) return console.error(err);
  console.log(results);
  db.close();
  return;
};