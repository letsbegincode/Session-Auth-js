# Session-Based Authentication System

This project implements a secure session-based authentication system using Node.js, Express, MongoDB, and other modern tools and libraries. It supports user authentication, role-based access control, session management, and password reset functionality.

## Features

1. **User Authentication**:
   - Register
   - Login
   - Logout
2. **Session Management**:
   - Secure sessions with expiration handling.
   - Regenerate session IDs to prevent fixation attacks.
3. **Role-Based Access Control**:
   - Differentiate users based on roles (e.g., admin, user).
   - Restrict access to specific routes based on roles.
4. **Password Management**:
   - Password hashing using bcrypt.
   - Password reset functionality with validation.
5. **Rate Limiting**:
   - Protect routes from excessive API requests.
6. **Security Enhancements**:
   - CSRF protection.
   - Helmet for setting secure HTTP headers.
7. **Input Validation with Joi**:
   - Validates user inputs for registration, login, and password reset to ensure data integrity and security.

---

## Prerequisites

- Node.js (v16 or later)
- MongoDB (v4.4 or later)

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/users
   PORT=3000
   SESSION_SECRET="secretKeyHaiye"
   NODE_ENV=development
   SECRET=secret
   MAX_AGE=40000
   LOGIN_LIMIT=3
   API_REQ_LIMIT_TIME=10000
   PROFILE_LOCK_TIME=60000
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. For development mode with live reload:
   ```bash
   npm run dev
   ```

---

## API Endpoints and Request Formats

### **Authentication Routes**

#### 1. **Register**
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "exampleUser",
  "email": "example@example.com",
  "password": "Password123",
  "role": "user"
}
```

**Response:**
- Success: `201 Created`
- Failure: Appropriate error message with status code.

#### 2. **Login**
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "exampleUser",
  "password": "Password123"
}
```

**Response:**
- Success: `200 OK` with session info.
- Failure: `401 Unauthorized` or `400 Bad Request`.

#### 3. **Logout**
**POST** `/auth/logout`

**Response:**
- Success: `200 OK`.
- Failure: Appropriate error message.

---

### **Password Management**

#### 1. **Reset Password**
**POST** `/auth/reset`

**Request Body:**
```json
{
  "username": "exampleUser",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response:**
- Success: `200 OK` with confirmation message.
- Failure: Appropriate error message.

---

### **Role-Based Access**

#### 1. **Restricted Route Example**
**GET** `/data/admin`

**Headers:**
- Must include a valid session cookie.

**Response:**
- Success: `200 OK` with data.
- Failure: `403 Forbidden` or `401 Unauthorized`.

---

## Directory Structure

```plaintext
Session Auth js/
|-- app.js
|-- models/
|   |-- User.js
|-- routes/
|   |-- authRoutes.js
|-- controllers/
|   |-- authController.js
|   |-- dataController.js
|-- middleware/
|   |-- authMiddleware.js
|   |-- sessionMiddleware.js
|   |-- rateLimiter.js
|-- .env
|-- package.json
```

---

## Security Highlights

1. **Password Hashing**: All passwords are hashed with bcrypt before being stored in the database.
2. **Session Security**:
   - Sessions are signed and stored securely.
   - Session regeneration prevents fixation attacks.
3. **Rate Limiting**: Protects against brute force and denial-of-service attacks.
4. **Input Validation**: Validates all user inputs to prevent injection attacks using Joi.

---

## Dependencies

### Production
- `bcrypt`: Password hashing.
- `body-parser`: Parse incoming request bodies.
- `connect-mongo`: Store sessions in MongoDB.
- `cookie-parser`: Parse and manage cookies.
- `cors`: Enable cross-origin requests.
- `csurf`: Protect against CSRF attacks.
- `dotenv`: Manage environment variables.
- `ejs`: Templating engine.
- `express`: Web framework.
- `express-rate-limit`: Limit repeated requests.
- `express-session`: Manage user sessions.
- `helmet`: Secure HTTP headers.
- `joi`: Input validation.
- `mongoose`: MongoDB ODM.

### Development
- `nodemon`: Auto-restart during development.

---

## Notes

1. Ensure MongoDB is running locally or update the `MONGO_URI` in `.env` for a cloud database.
2. For production, replace `SESSION_SECRET` and `SECRET` with strong, unique values.
3. Always validate user input on both client and server sides.

