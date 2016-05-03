'use strict';

import mongoose from 'mongoose';

var TypeEffetSchema = new mongoose.Schema({
  titre: String,
  active: Boolean
});

export default mongoose.model('TypeEffet', TypeEffetSchema);
