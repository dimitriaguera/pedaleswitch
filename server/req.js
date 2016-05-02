import Composant from './api/composant/composant.model';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/pedaleswitch-dev');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  Composant.find(function (err, results) {
    if (err) return console.error(err);
      console.log(results);
  })

});


