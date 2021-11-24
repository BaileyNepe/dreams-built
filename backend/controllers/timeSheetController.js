const asyncHandler = require('express-async-handler');
const TimeSheetEntry = require('../models/TimeSheetEntryModel');
const User = require('../models/userModel');

/**
 * @Desc Create a user timesheet entry
 * @Route POST /api/timesheet/user/:id
 * @Access Private
 */

const createUserEntry = asyncHandler(async (req, res) => {
  const { weekStart, weekEnd, entries } = req.body;

  const user = await User.findById(req.params.id);

  if (user.userId !== req.user.azp) {
    res.status(401);
    throw new Error('Invalid user credentials');
  }

  // TODO - Run validation on parameters

  await TimeSheetEntry.updateMany({ weekStart: weekStart, user: req.params.id, userId: req.user.azp }, { $set: { isArchive: true } });

  await entries.map((entry) => {
    TimeSheetEntry.create({
      user: req.params.id,
      userId: req.user.azp,
      entryId: entry.entryId,
      day: entry.day,
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      jobNumber: entry.jobNumber,
      jobTime: entry.jobTime,
      weekStart: weekStart,
      weekEnd: weekEnd,
    });
  });

  res.status(201).json({ message: 'timesheet data saved!' });
});

/**
 * @Desc Get all users timesheet entries for week
 * @Route GET /api/timesheet/admin
 * @Access Private - Admin
 */

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await TimeSheetEntry.find({ weekStart: req.query.weekstart }).populate('user', 'firstName lastName hourlyRate');

  res.json(result);
});

/**
 * @Desc Delete user archive timesheet entries
 * @Route POST /api/timesheet/admin/archive
 * @Access Private - Admin
 */

const deleteArchive = asyncHandler(async (req, res) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const fields = { isArchive: true, updatedAt: { $lt: cutoff } };

  const entries = await TimeSheetEntry.find(fields);
  await TimeSheetEntry.deleteMany(fields);
  res.json({ cutOffDate: cutoff, deletedEntries: entries.length });
});

module.exports = { createUserEntry, getAllUsers, deleteArchive };
