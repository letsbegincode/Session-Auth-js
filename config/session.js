const MongoStore = require('connect-mongo');

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: 'sessions',
  ttl: 3600, // 1 hour
});

module.exports = sessionStore;
