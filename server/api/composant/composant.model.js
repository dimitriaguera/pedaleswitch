'use strict';

import mongoose from 'mongoose';

var ComposantSchema = new mongoose.Schema({
  titre: String,
  type: String,
  description: Boolean,
  prix_additionnel: Number,
  shape: String,
  size: {
    w:Number,
    h:Number
  },
  media: [],
  publie: {
    type: Boolean,
    default: false,
    //  required: [true, 'Champ publié de l\'option requis']
  },
  disponibilite: {
    type: String,
    enum: ['enStock', 'enReap', 'enRupture'],
    default: 'enStock',
    //   required: [true, 'Champ disponibilité de l\'option requis']
  },
});

export default mongoose.model('Composant', ComposantSchema);