const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

/**
 * Register a new user
 * @route POST /api/auth/signup
 */
const register = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        first_name,
        last_name,
        email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the current user's profile
 * @route GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user data (excluding password)
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the current user's personal information
 * @route PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUsers[0].email) {
      const [duplicateEmails] = await pool.query(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (duplicateEmails.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use'
        });
      }
    }

    // Update user information
    await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
      [first_name, last_name, email, userId]
    );

    // Get updated user data
    const [updatedUsers] = await pool.query(
      'SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUsers[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change the current user's password
 * @route PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Get user with password
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update the password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};