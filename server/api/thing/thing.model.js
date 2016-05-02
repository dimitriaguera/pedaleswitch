'use strict';

import mongoose from 'mongoose';

var TypeSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Thing', TypeSchema);
