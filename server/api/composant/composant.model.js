'use strict';

import mongoose from 'mongoose';

var ComposantSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Champ type du composant requis']
  },
  titre: {
    type: String,
    required: [true, 'Champ titre du composant requis']
  },
  description: {
    type: String,
    required: [true, 'Champ description du composant requis']
  },
  prix_additionnel: {
    type: Number,
    required: [true, 'Champ prix additionnel du composant requis']
  },
  shape: {
    type: String,
    required: [true, 'Champ shape (forme) du composant requis'],
    default: 'Rect',
  },
  size: {
    w:{
      type: Number,
      required: [true, 'Champ largeur du composant requis']
    },
    h:{
      type: Number,
      required: [true, 'Champ hauteur du composant requis']
    }
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