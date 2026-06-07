/**
 * Candidate model
 *
 * Data isolation rules (enforced at both API and DB query level):
 *   t-1 : sees all candidates
 *   t-2 : sees only candidates they added (addedBy === their userId)
 *   t-3 : sees only candidates explicitly in their sharedWith array
 *
 * This means t-2 recruiters CANNOT see each other's candidates — preventing
 * inter-recruiter data leakage.
 */
import mongoose from 'mongoose';

const workHistorySchema = new mongoose.Schema({
  company:     String,
  role:        String,
  from:        String,
  to:          String,
  description: String,
}, { _id: false });

const educationSchema = new mongoose.Schema({
  degree:      String,
  institution: String,
  year:        Number,
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  firstName:       { type: String, required: true, trim: true },
  lastName:        { type: String, required: true, trim: true },
  email:           { type: String, required: true, trim: true, lowercase: true },
  phone:           { type: String, trim: true, default: '' },
  location:        { type: String, trim: true, default: '' },
  noticePeriod:    { type: String, default: '2 weeks' },
  currentRole:     { type: String, required: true, trim: true },
  currentCompany:  { type: String, trim: true, default: '' },
  totalExperience: { type: Number, required: true, min: 0 },
  skills:          [{ type: String, trim: true }],
  education:       [educationSchema],
  workHistory:     [workHistorySchema],
  status:          {
    type: String,
    enum: ['Active', 'Interviewing', 'Placed', 'Inactive', 'Rejected'],
    default: 'Active',
  },
  addedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // t-3 clients explicitly shared this candidate with
  sharedWith:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notes:           { type: String, default: '' },
  linkedIn:        { type: String, default: '' },
  resumeUrl:       { type: String, default: null },   // Cloudinary URL
  resumePublicId:  { type: String, default: null },   // Cloudinary public_id
}, { timestamps: true });

// Indexes for fast filtered queries
candidateSchema.index({ addedBy: 1 });
candidateSchema.index({ sharedWith: 1 });
candidateSchema.index({ status: 1 });

export default mongoose.model('Candidate', candidateSchema);
