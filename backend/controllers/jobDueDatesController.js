const asyncHandler = require('express-async-handler');
const { DateTime } = require('luxon');
const JobDetails = require('../models/jobModel');
const JobDueDate = require('../models/jobPartDueDateModel');
const JobPart = require('../models/jobPartModel');

/**
 * @Desc Get a list of all due dates for every job
 * @Route /api/job/duedates/parts
 * @Access Private ("read:due_dates", employee, admin)
 */

const getAllJobDueDates = asyncHandler(async (req, res) => {
  const jobDueDates = await JobDueDate.find({ dueDateRange: { $gte: req.query.rangeStart, $lt: req.query.rangeEnd } }).populate('job jobPartTitle', 'jobNumber client address jobPartTitle jobOrder color');

  res.json(jobDueDates);
});

/**
 * @Desc Get a list of all due dates for a job
 * @Route /api/job/duedates/parts/:jobid
 * @Access Private ("read:due_dates", employee, admin)
 */

const getJobPartDueDates = asyncHandler(async (req, res) => {
  const jobParams = req.params.jobid;

  const checkJobExists = await JobDetails.findById(jobParams);

  if (checkJobExists) {
    const jobDueDates = await JobDueDate.find({ job: req.params.jobid }).populate('jobPartTitle', 'jobPartTitle');
    res.json(jobDueDates);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

/**
 * @Desc Create a job's part duedates
 * @Route /api/job/duedates/parts/:jobid
 * @Access Private (admin)
 */

const createJobPartDueDate = asyncHandler(async (req, res) => {
  const { dueDate } = req.body;
  const jobId = req.params.jobid;

  const partId = req.query.partid;
  await JobPart.findById(partId);

  const exists = await JobDueDate.findOne({ job: jobId, jobPartTitle: partId });

  if (exists) {
    res.status(400);
    throw new Error('Due date already exists');
  }
  const created = await JobDueDate.create({ job: jobId, jobPartTitle: partId, dueDate: dueDate, dueDateRange: dueDate });

  res.status(201).json(created);
});

/**
 * @Desc Update due dates of all due dates for a job
 * @Route /api/job/duedates/parts/:jobid
 * @Access Private (employee, admin)
 */

const patchJobPartDueDates = asyncHandler(async (req, res) => {
  const jobId = req.params.jobid;
  const jobDueDates = await JobDueDate.find({ job: jobId });
  for (const dueDate of jobDueDates) {
    const newDueDate = DateTime.fromFormat(dueDate.dueDate, 'yyyy-MM-dd').plus({ days: req.body.scheduleShift }).toFormat('yyyy-MM-dd');
    await JobDueDate.findByIdAndUpdate(dueDate._id, {
      dueDate: newDueDate,
      dueDateRange: newDueDate,
    });
  }

  res.json({ message: 'success' });
});

/**
 * @Desc Delete all of a job's duedates
 * @Route /api/job/duedates/parts/:jobid
 * @Access Private (admin)
 */

const deleteJobPartDueDates = asyncHandler(async (req, res) => {
  const jobId = req.params.jobid;
  await JobDueDate.deleteMany({ job: jobId });
  res.json({ message: 'deleted!' });
});

/**
 * @Desc Update a job's part's duedate all fields
 * @Route /api/job/duedates/job/part/:id
 * @Access Private (admin)
 */

const updateJobPartDueDate = asyncHandler(async (req, res) => {
  const { dueDate, contractor } = req.body;
  const jobPartDueDateItem = await JobDueDate.findById(req.params.id);

  if (jobPartDueDateItem) {
    jobPartDueDateItem.dueDate = dueDate;
    jobPartDueDateItem.dueDateRange = dueDate;
    jobPartDueDateItem.contractor = contractor;

    const updatedDueDate = await jobPartDueDateItem.save();
    res.json(updatedDueDate);
  }
});

/**
 * @Desc Update a job's part's duedate field only
 * @Route /api/job/duedates/job/part/:id
 * @Access Private (admin)
 */

const patchJobPartDueDate = asyncHandler(async (req, res) => {
  const { dueDate } = req.body;
  const jobPartDueDateItem = await JobDueDate.findById(req.params.id);

  if (jobPartDueDateItem) {
    await JobDueDate.findByIdAndUpdate(req.params.id, {
      dueDate: dueDate,
      dueDateRange: dueDate,
    });

    res.json({ message: 'due date updated' });
  }
});

/**
 * @Desc Delete a job's part's duedate
 * @Route /api/job/
 * @Access Private (admin)
 */

const deleteJobPartDueDate = asyncHandler(async (req, res) => {
  const jobDueDate = await JobDueDate.findById(req.params.id);

  if (jobDueDate) {
    await jobDueDate.remove();
    res.json({ message: 'Deleted!' });
  } else {
    res.status(404);
  }
});

module.exports = { getAllJobDueDates, getJobPartDueDates, patchJobPartDueDates, deleteJobPartDueDates, createJobPartDueDate, patchJobPartDueDate, updateJobPartDueDate, deleteJobPartDueDate };
