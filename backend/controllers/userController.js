const asyncHandler = require('express-async-handler');
const axios = require('axios').default;
const User = require('../models/userModel');
const { domain, auth0ClientId, auth0ClientSecret } = require('../config/env');

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

  res.json({ users: mergedData, pages: Math.ceil(data.total / pageSize) });
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
 * @Route GET /api/users/:id
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
    res.json({ user: user, roles: data });
  } else {
    res.status(404);
    throw new Error('User does not exist');
  }
});

/**
 * @Desc Update a single user
 * @Route PUT /api/users/:id
 * @Access Private ("update:users" admin)
 */

const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, auth0Email, hourlyRate } = req.body;

  const user = await User.findById(req.params.id);

  if (user) {
    user.firstName = firstName;
    user.lastName = lastName;
    user.auth0Email = auth0Email;
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
 * @Route DELETE /api/users/:id
 * @Access Private ("delete:users", admin)
 */

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
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
 * @Route PUT /api/users/:id
 * @Access Private ("update:user_profile", employee)
 */

const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, auth0Email } = req.body;

  const user = await User.findOne({ userId: req.params.id });

  if (user) {
    user.firstName = firstName;
    user.lastName = lastName;
    user.auth0Email = auth0Email;

    await user.save();

    res.json({ message: 'Details updated!' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getUsers, createUser, getUser, updateUser, deleteUser, getUserProfile, updateUserProfile };
