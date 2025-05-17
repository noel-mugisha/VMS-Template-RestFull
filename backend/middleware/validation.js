const { body, validationResult, param } = require('express-validator');

/**
 * Middleware to validate request data
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

/**
 * Validation rules for updating user profile
 */
const updateProfileValidation = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  validate
];

/**
 * Validation rules for changing password
 */
const changePasswordValidation = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    .notEmpty().withMessage('New password is required'),
  validate
];

/**
 * Validation rules for creating/updating a vehicle
 */
const vehicleValidation = [
  body('plate_number')
    .notEmpty().withMessage('Plate number is required')
    .matches(/^RA[A-Z][0-9]{3}[A-Z]$/).withMessage('Invalid plate number format. Use format like RAA001A'),
  body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year'),
  body('status')
    .optional()
    .isIn(['valid', 'expired']).withMessage('Status must be either valid or expired'),
  validate
];

/**
 * Validation for vehicle ID parameter
 */
const validateVehicleId = [
  param('id').isInt().withMessage('Invalid vehicle ID'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  vehicleValidation,
  validateVehicleId
};