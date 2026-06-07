import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  client:         { type: String, required: true, trim: true },
  description:    { type: String, default: '' },
  location:       { type: String, default: '' },
  type:           { type: String, default: 'Full-time' },
  remote:         { type: String, default: 'Hybrid' },
  salaryMin:      { type: Number, default: null },
  salaryMax:      { type: Number, default: null },
  requiredSkills: [{ type: String, trim: true }],
  emphasisSkill:  { type: String, trim: true, default: '' },
  minExperience:  { type: Number, default: 0 },
  noticePeriod:   { type: String, default: 'Any' },
  status:         {
    type: String,
    enum: ['Active', 'On Hold', 'Filled', 'Cancelled'],
    default: 'Active',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
