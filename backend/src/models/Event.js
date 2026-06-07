import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url:                { type: String, required: true },
  caption:            { type: String, default: '' },
  cloudinaryPublicId: { type: String, default: null },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  type:            { type: String, enum: ['upcoming', 'past'], required: true },
  title:           { type: String, required: true, trim: true },
  date:            { type: String, required: true },
  time:            { type: String, default: '' },
  location:        { type: String, required: true, trim: true },
  venueUrl:        { type: String, default: '' },
  theme:           { type: String, default: '' },
  teaser:          { type: String, default: '' },
  description:     { type: String, default: '' },
  participants:    { type: Number, default: null },
  facilitator:     { type: String, default: '' },
  duration:        { type: String, default: '2 hours' },
  images:          [imageSchema],
  coverImageIndex: { type: Number, default: 0 },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
