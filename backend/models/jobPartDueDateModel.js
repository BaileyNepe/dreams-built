const mongoose = require('mongoose');

const jobDueDateSchema = mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'JobDetails',
  },
  jobPartTitle: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'JobPart',
  },
  dueDate: { type: String },
  startDate: { type: String },
  dueDateRange: [{ type: Date }],
  contractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contractor' }],
});

const JobDueDate = mongoose.model('JobDueDate', jobDueDateSchema);

module.exports = JobDueDate;
