'use strict';

import mongoose from 'mongoose';

var TypeEffetSchema = new mongoose.Schema({
  name: String,
  active: Boolean
});

export default mongoose.model('TypeEffet', TypeEffetSchema);
