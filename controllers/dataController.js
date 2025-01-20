// Controller for the admin-only data route
exports.getAdminData = (req, res) => {
  res.status(200).json({ 
    message: 'Welcome, Admin! Here is the protected data.',
    data: { sensitiveInfo: 'This is admin-level sensitive data.' }
  });
};

// Controller for the public data route
exports.getPublicData = (req, res) => {
  res.status(200).json({ 
    message: 'This is a public route accessible to anyone.', 
    data: { info: 'Here is some public information.' }
  });
};
