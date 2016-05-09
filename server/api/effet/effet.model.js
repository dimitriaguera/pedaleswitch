'use strict';

import mongoose from 'mongoose';

var ComposantEffetSchema = new mongoose.Schema({
  titre: String,
  available_compo_id: [],
  coordonnees: {
    x:Number,
    y:Number
  }
});

var OptionSchema = new mongoose.Schema({
  titre: String,
  description: String,
  disponible: Boolean,
  prix: Number,
  media: [],
  dimensions: {
    w:Number,
    h:Number
  },
  composants: [ComposantEffetSchema]
});

var EffetSchema = new mongoose.Schema({
  titre: String,
  description: String,
  type: String,
  disponible: Boolean,
  options: [OptionSchema],
});

export default mongoose.model('Effet', EffetSchema);

