'use strict';

import mongoose from 'mongoose';

var ComposantEffetSchema = new mongoose.Schema({
  compo_id: [],
  coordonnées: {x:Number, y:Number}
});

var OptionSchema = new mongoose.Schema({
  titre: String,
  description: String,
  disponible: Boolean,
  prix: Number,
  media: [],
  dimensions: {x:Number, y:Number},
  composants: [ComposantEffetSchema]
});

var EffetSchema = new mongoose.Schema({
  titre: String,
  description: String,
  type: String,
  disponible: Boolean,
  options: [OptionSchema]
});

export default mongoose.model('Effet', EffetSchema);