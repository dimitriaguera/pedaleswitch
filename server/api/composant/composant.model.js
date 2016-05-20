'use strict';

import mongoose from 'mongoose';

var ComposantSchema = new mongoose.Schema({
  titre: String,
  type: String,
  description: String,
  disponible: Boolean,
  prix_additionnel: Number,
  dimensions: {w:Number, h:Number},
  media: []
});

export default mongoose.model('Composant', ComposantSchema);