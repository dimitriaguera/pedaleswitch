'use strict';

import mongoose from 'mongoose';

var TypeEffetSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Champ titre du type d\'effet requis']
  },
  active: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('TypeEffet', TypeEffetSchema);
