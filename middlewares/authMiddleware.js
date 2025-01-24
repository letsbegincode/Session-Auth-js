// Protect routes
exports.protect = (req, res, next) => {
  if (!req.session || !req.session.user || !req.session.user.id ) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  req.user = req.session.user;
  next();
};

// Role-based authorization
exports.restrictTo = (role) => (req, res, next) => {
  if (req.session.user.role !== role) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};


exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
};

exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized. Please log in to proceed.' });
};
