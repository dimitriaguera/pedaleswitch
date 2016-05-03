'use strict';

import mongoose from 'mongoose';

var EffetSchema = new mongoose.Schema({
  titre: String,
  description: String,
  type: String,
  disponible: Boolean,
  options: {}
});

var OptionSchema = new mongoose.Schema({
  titre: String,
  description: String,
  disponible: Boolean,
  prix: Number,
  media: [],
  dimensions: {x:Number, y:Number},
  composants: {}
});

var ComposantEffetSchema = new mongoose.Schema({
  compo_id: [],
  coordonnées: {x:Number, y:Number}
});

export default mongoose.model('Effet', EffetSchema);