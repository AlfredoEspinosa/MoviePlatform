const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    error: `Server error: ${err}`,
    message: process.env.NODE_ENV === 'production' ? null : err.message
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Resource not found ${req.method}: ${req.path}`
  });
};

module.exports = { errorHandler, notFound };