'use strict';

import mongoose from 'mongoose';

var ComposantSchema = new mongoose.Schema({

  disponible: Boolean,
  prix_additionnel: Number,
  compo_id: Number,
  titre: String,
  type: String,
  dimentions: [],
  media: [],
  description: String
});

export default mongoose.model('Composant', ComposantSchema);
