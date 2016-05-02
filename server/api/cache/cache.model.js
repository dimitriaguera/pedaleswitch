'use strict';

import mongoose from 'mongoose';

var CacheEffetSchema = new mongoose.Schema({
  name: String,
  info: String,
  type: String,
  active: Boolean
});
var CacheSchema = new mongoose.Schema({
  name: String,
  info: String,
  type: String,
  active: Boolean
});

export default mongoose.model('Cache', CacheSchema);
