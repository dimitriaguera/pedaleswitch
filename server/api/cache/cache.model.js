'use strict';

import mongoose from 'mongoose';

var CacheComposantEffetSchema = new mongoose.Schema({
  titre: String,
  available_compo_id: [],
  coordonnées: {
    x:Number,
    y:Number
  }
});

var CacheOptionSchema = new mongoose.Schema({
  titre: String,
  description: String,
  disponible: Boolean,
  prix: Number,
  media: [],
  dimensions: {
    w:Number,
    h:Number
  },
  composants: [CacheComposantEffetSchema]
});

var CacheSchema = new mongoose.Schema({
  titre: String,
  description: String,
  type: String,
  disponible: Boolean,
  options: [CacheOptionSchema],
});

export default mongoose.model('Cache', CacheSchema);
