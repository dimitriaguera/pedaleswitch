'use strict';

import mongoose from 'mongoose';

var ComposantTypeSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Champ titre du type de composant requis']
  },
  active: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('ComposantType', ComposantTypeSchema);
