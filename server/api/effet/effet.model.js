'use strict';

import mongoose from 'mongoose';

var EffetSchema = new mongoose.Schema({
  name: String,
  info: String,
  type: String,
  active: Boolean
});

export default mongoose.model('Effet', EffetSchema);
