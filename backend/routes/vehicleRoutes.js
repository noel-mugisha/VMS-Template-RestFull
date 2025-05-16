const express = require('express');
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const { authenticateToken } = require('../middleware/auth');
const { vehicleValidation, validateVehicleId } = require('../middleware/validation');

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles for the logged-in user
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of vehicles
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllVehicles);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get a specific vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', validateVehicleId, getVehicleById);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plate_number
 *               - manufacturer
 *               - model
 *               - year
 *             properties:
 *               plate_number:
 *                 type: string
 *                 description: Vehicle plate number (format RAA001A)
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [valid, expired]
 *                 default: valid
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', vehicleValidation, createVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plate_number
 *               - manufacturer
 *               - model
 *               - year
 *             properties:
 *               plate_number:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [valid, expired]
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Vehicle not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', validateVehicleId, vehicleValidation, updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     responses:
 *       204:
 *         description: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', validateVehicleId, deleteVehicle);

module.exports = router;