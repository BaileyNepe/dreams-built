const asyncHandler = require('express-async-handler');
const axios = require('axios').default;
const User = require('../models/userModel');
const TimesheetEntry = require('../models/timesheetEntryModel');
const TimesheetComment = require('../models/timesheetCommentModel');
const { domain, auth0ClientId, auth0ClientSecret } = require('../config/env');
const dotenv = require('dotenv');

dotenv.config();
/**
 * @Desc Get a list of all users
 * @Route GET /api/users
 * @Access Private ("read:users", admin)
 */

const getUsers = asyncHandler(async (req, res) => {
  const pageSize = req.query.limit || '25';
  const page = req.query.page - 1 || '0';

  const userListMongo = await User.find();
  const body = { client_id: auth0ClientId, client_secret: auth0ClientSecret, audience: `https://${domain}/api/v2/`, grant_type: 'client_credentials' };

  const userList = userListMongo.map((user) => user.toObject());
  const options = {
    headers: { 'content-type': 'application/json' },
  };

  const token = await axios.post(`https://${domain}/oauth/token`, body, options);

  const config = {
    headers: { Authorization: `Bearer ${token.data.access_token}` },
  };
  const { data } = await axios.get(`https://${domain}/api/v2/users?per_page=${pageSize}&include_totals=true&search_engine=v3&page=${page}&q=${req.query.keyword}`, config);

  const mergedData = data.users.map((authUser) => ({ ...authUser, ...userList.find((dbUser) => dbUser.userId === authUser.user_id) }));

  //remove user emails and other personal details to allow users to view admin dashboard without seeing other user's personal information
  const filterOutUserEmail = mergedData.map((details) => {
    return {
      firstName: details.firstName || 'noname',
      lastName: details.lastName || 'noname',
      hourlyRate: details.hourlyRate,
      email: 'private',
      last_login: details.last_login,
      picture: 'https://lh3.googleusercontent.com/a/AATXAJyKEBN-XVjwxUVakokeEF83h2LMO1pv_xE4PfEg=s96-c',
      _id: details._id,
      userId: details.userId,
    };
  });

  res.json({ users: filterOutUserEmail, pages: Math.ceil(data.total / pageSize) });
});

/**
 * @Desc Create a user
 * @Route POST /api/users
 * @Access Public
 */

const createUser = asyncHandler(async (req, res) => {
  const { userId, firstName, lastName, auth0Email } = req.body;

  const user = await User.findOne({ userId: userId });

  if (!user) {
    const newUser = {
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      auth0Email: auth0Email,
    };
    const createdUser = await User.create(newUser);
    res.status(201).json(createdUser);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @Desc Get a user's details
 * @Route GET /api/users/user/:id
 * @Access Private ("read:users", admin)
 */

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    const body = { client_id: auth0ClientId, client_secret: auth0ClientSecret, audience: `https://${domain}/api/v2/`, grant_type: 'client_credentials' };

    const options = {
      headers: { 'content-type': 'application/json' },
    };

    const token = await axios.post(`https://${domain}/oauth/token`, body, options);

    const config = {
      headers: { Authorization: `Bearer ${token.data.access_token}` },
    };
    const { data } = await axios.get(`https://${domain}/api/v2/users/${user.userId}/roles`, config);

    const filteredUser = {
      _id: user._id,
      userId: user.userId,
      firstName: user.firstName || 'noname',
      lastName: user.lastName || 'noname',
      hourlyRate: user.hourlyRate,
      auth0Email: 'private',
    };

    res.json({ user: filteredUser, roles: data });
  } else {
    res.status(404);
    throw new Error('User does not exist');
  }
});

/**
 * @Desc Update a single user
 * @Route PUT /api/users/user/:id
 * @Access Private ("update:users" admin)
 */

const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, auth0Email, hourlyRate } = req.body;

  const user = await User.findById(req.params.id);

  if (user) {
    user.firstName = firstName;
    user.lastName = lastName;
    user.auth0Email = auth0Email || user.auth0Email;
    user.hourlyRate = hourlyRate;

    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @Desc Delete a single user
 * @Route DELETE /api/users/user/:id
 * @Access Private ("delete:users", admin)
 */

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const checkUserUsedInTimesheetEntry = await TimesheetEntry.find({ user: user._id });
    if (checkUserUsedInTimesheetEntry.length > 0) {
      res.status(400);
      throw new Error('User is referenced in Timesheet Entries');
    }

    const checkUserUsedInTimesheetComments = await TimesheetComment.find({ user: user._id });
    if (checkUserUsedInTimesheetComments.length > 0) {
      res.status(400);
      throw new Error('User is referenced in Timesheet Comments');
    }

    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @Desc Add a user role to user
 * @Route POST /api/users/roles/user/:id
 * @Access Private ("update:users", admin)
 */

const addRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const body = { client_id: auth0ClientId, client_secret: auth0ClientSecret, audience: `https://${domain}/api/v2/`, grant_type: 'client_credentials' };

    const options = {
      headers: { 'content-type': 'application/json' },
    };

    const token = await axios.post(`https://${domain}/oauth/token`, body, options);

    let role;
    if (req.query.role === 'admin') {
      role = process.env.AUTH0_ADMIN_ROLE;
    }

    if (req.query.role === 'employee') {
      role = process.env.AUTH0_EMPLOYEE_ROLE;
    }

    const config = {
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token.data.access_token}`, 'cache-control': 'no-cache' },
    };

    await axios.post(`https://${domain}/api/v2/users/${user.userId}/roles`, { roles: [role] }, config).catch((e) => console.log(e));
    const roles = await axios.get(`https://${domain}/api/v2/users/${user.userId}/roles`, config);
    res.json({ user: user, roles: roles.data });
  } else {
    res.status(404);
    throw new Error('User does not exist');
  }
});

/**
 * @Desc Remove a user role from a user
 * @Route POST /api/users/roles/user/:id
 * @Access Private ("update:users", admin)
 */

const deleteRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const body = { client_id: auth0ClientId, client_secret: auth0ClientSecret, audience: `https://${domain}/api/v2/`, grant_type: 'client_credentials' };

    const options = {
      headers: { 'content-type': 'application/json' },
    };

    const token = await axios.post(`https://${domain}/oauth/token`, body, options);

    let role;
    if (req.query.role === 'admin') {
      role = process.env.AUTH0_ADMIN_ROLE;
    }

    if (req.query.role === 'employee') {
      role = process.env.AUTH0_EMPLOYEE_ROLE;
    }

    const config = {
      headers: { Authorization: `Bearer ${token.data.access_token}` },
      data: { roles: [role] },
    };

    await axios.delete(`https://${domain}/api/v2/users/${user.userId}/roles`, config);
    const roles = await axios.get(`https://${domain}/api/v2/users/${user.userId}/roles`, config);

    res.json({ user: user, roles: roles.data });
  } else {
    res.status(404);
    throw new Error('User does not exist');
  }
});

/**
 * @Desc Get a user's profile
 * @Route GET /api/users/profile/:id
 * @Access Private ("read:user_profile", employee)
 */

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ userId: req.params.id });

  if (user) {
    const userProfile = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      auth0Email: user.auth0Email,
    };

    res.json(userProfile);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @Desc Update user profile
 * @Route PUT /api/users/profile/:id
 * @Access Private ("update:user_profile", employee)
 */

const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;

  const user = await User.findOne({ userId: req.params.id });
  if (user) {
    user.firstName = firstName;
    user.lastName = lastName;

    await user.save();

    const userProfile = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      auth0Email: user.auth0Email,
    };

    res.json({ message: 'Details updated!', userProfile: userProfile });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getUsers, createUser, getUser, updateUser, deleteUser, addRole, deleteRole, getUserProfile, updateUserProfile };
