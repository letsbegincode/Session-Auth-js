/session-auth
│
├── app.js                      # Main application file
├── package.json                # Dependencies
├── .env                        # Environment variables
│
├── /config                     # Configuration files
│   ├── db.js                   # MongoDB connection setup
│   └── sessionStore.js         # MongoDB session store
│
├── /controllers                # Route handlers
│   └── authController.js       # Authentication logic
│
├── /middlewares                # Custom middleware
│   ├── authMiddleware.js       # Session validation and role checks
│   └── rateLimiter.js          # Rate-limiting logic
│
├── /models                     # Database models
│   └── User.js                 # User schema
│
├── /routes                     # Route definitions
│   └── authRoutes.js           # Authentication routes
│
└── /utils                      # Utility functions
    └── hashUtils.js            # Password hashing and comparison
