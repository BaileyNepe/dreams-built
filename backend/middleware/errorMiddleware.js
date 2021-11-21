const authorizationError = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(403);
  }
  next(err);
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    statusCode: statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { authorizationError, notFound, errorHandler };
