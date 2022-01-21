const asyncHandler = require('express-async-handler');
const JobPart = require('../models/jobPartModel');

/**
 * @Desc Get a list of all job parts
 * @Route GET /api/job/parts
 * @Access Private ("read:job_parts", employee, admin)
 */

const getJobParts = asyncHandler(async (req, res) => {
  const jobParts = await JobPart.find();
  res.json(jobParts);
});

/**
 * @Desc Create a new job part
 * @Route POST /api/job/parts
 * @Access Private ("create:job_parts", admin)
 */

const createJobPart = asyncHandler(async (req, res) => {
  const { jobPartTitle, jobOrder, jobDescription } = req.body;

  const checkJobPartExists = await JobPart.findOne({ jobPartTitle: jobPartTitle });

  const allJobParts = await JobPart.find();

  if (checkJobPartExists) {
    res.status(400);
    throw new Error('Job Part already exists!');
  }

  const parseJobOrder = jobOrder ? +jobOrder : allJobParts.length;

  const createdJobPart = await JobPart.create({
    jobPartTitle: jobPartTitle,
    jobDescription: jobDescription,
    jobOrder: parseJobOrder,
  });

  res.status(201).json(createdJobPart);
});

/**
 * @Desc Get a job part
 * @Route GET /api/job/parts/:id
 * @Access Private (admin)
 */

const getJobPart = asyncHandler(async (req, res) => {
  const jobPart = await JobPart.findById(req.params.id);

  if (jobPart) {
    res.json(jobPart);
  } else {
    res.status(404);
  }
});

/**
 * @Desc Update a job part
 * @Route PUT /api/job/parts/:id
 * @Access Private (admin)
 */

const updateJobPart = asyncHandler(async (req, res) => {
  const { jobPartTitle, jobDescription, jobOrder } = req.body;

  const jobPartData = await JobPart.findById(req.params.id);

  if (jobPartData) {
    jobPartData.jobPartTitle = jobPartTitle;
    jobPartData.jobDescription = jobDescription;
    jobPartData.jobOrder = jobOrder;

    const updatedJobPart = await jobPartData.save();
    res.json(updatedJobPart);
  } else {
    res.status(404);
  }
});

/**
 * @Desc Delete a job part
 * @Route DELETE /api/job/parts/:id
 * @Access Private (admin)
 */

const deleteJobPart = asyncHandler(async (req, res) => {
  const jobPart = await JobPart.findById(req.params.id);

  await jobPart.remove();
  res.json({ message: 'Job part removed' });
});

module.exports = { getJobParts, createJobPart, getJobPart, updateJobPart, deleteJobPart };
