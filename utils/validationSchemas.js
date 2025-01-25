const Joi = require('joi');

// User registration schema
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('user', 'admin').required(),
});

// User login schema
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Password reset schema
const resetSchema = Joi.object({
  username: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*\\d).*$'))
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

// Role validation schema
const roleSchema = Joi.string().valid('user', 'admin', 'moderator').required();

module.exports = {
  registerSchema,
  loginSchema,
  resetSchema,
  roleSchema,
};
