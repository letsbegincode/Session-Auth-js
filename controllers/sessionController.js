exports.login = (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).send('Username is required');
    }
    req.session.user = { username };
    res.send(`User ${username} logged in with session`);
  };
  
  exports.logout = (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to log out');
      }
      res.clearCookie('connect.sid');
      res.send('User logged out and session cleared');
    });
  };
  
  exports.checkSession = (req, res) => {
    if (req.session.user) {
      res.send(`User is logged in as ${req.session.user.username}`);
    } else {
      res.status(401).send('No active session');
    }
  };
  