const { pool } = require('../config/db');

/**
 * Get all vehicles for the logged-in user with pagination
 * @route GET /api/vehicles
 */
const getAllVehicles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Get vehicles with pagination
    const [vehicles] = await pool.query(
      'SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM vehicles WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific vehicle by ID
 * @route GET /api/vehicles/:id
 */
const getVehicleById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    // Get the vehicle
    const [vehicles] = await pool.query(
      'SELECT * FROM vehicles WHERE id = ? AND user_id = ?',
      [vehicleId, userId]
    );

    if (vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicles[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new vehicle
 * @route POST /api/vehicles
 */
const createVehicle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { plate_number, manufacturer, model, year, status = 'valid' } = req.body;

    // Check if plate number already exists
    const [existingVehicles] = await pool.query(
      'SELECT * FROM vehicles WHERE plate_number = ?',
      [plate_number]
    );

    if (existingVehicles.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle with this plate number already exists'
      });
    }

    // Insert the new vehicle
    const [result] = await pool.query(
      'INSERT INTO vehicles (plate_number, manufacturer, model, year, status, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [plate_number, manufacturer, model, year, status, userId]
    );

    // Get the created vehicle
    const [vehicles] = await pool.query(
      'SELECT * FROM vehicles WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicles[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a vehicle
 * @route PUT /api/vehicles/:id
 */
const updateVehicle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;
    const { plate_number, manufacturer, model, year, status } = req.body;

    // Check if vehicle exists and belongs to the user
    const [existingVehicles] = await pool.query(
      'SELECT * FROM vehicles WHERE id = ? AND user_id = ?',
      [vehicleId, userId]
    );

    if (existingVehicles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Check if the new plate number already exists (if it's being changed)
    if (plate_number !== existingVehicles[0].plate_number) {
      const [duplicateVehicles] = await pool.query(
        'SELECT * FROM vehicles WHERE plate_number = ? AND id != ?',
        [plate_number, vehicleId]
      );

      if (duplicateVehicles.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle with this plate number already exists'
        });
      }
    }

    // Update the vehicle
    await pool.query(
      'UPDATE vehicles SET plate_number = ?, manufacturer = ?, model = ?, year = ?, status = ? WHERE id = ? AND user_id = ?',
      [plate_number, manufacturer, model, year, status, vehicleId, userId]
    );

    // Get the updated vehicle
    const [updatedVehicles] = await pool.query(
      'SELECT * FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicles[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a vehicle
 * @route DELETE /api/vehicles/:id
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    // Check if vehicle exists and belongs to the user
    const [existingVehicles] = await pool.query(
      'SELECT * FROM vehicles WHERE id = ? AND user_id = ?',
      [vehicleId, userId]
    );

    if (existingVehicles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Delete the vehicle
    await pool.query(
      'DELETE FROM vehicles WHERE id = ? AND user_id = ?',
      [vehicleId, userId]
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};