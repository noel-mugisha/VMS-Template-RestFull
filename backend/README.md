# RTA Vehicle Management System Backend

This is the backend API for the Rwanda Transport Authority (RTA) Vehicle Management System. It provides API endpoints for user authentication and vehicle management.

## Technologies Used

- Node.js with Express
- MySQL database
- JWT for authentication
- bcrypt for password hashing
- Swagger UI for API documentation

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure the environment:
- Create a `.env` file based on the `.env.example` template
- Set your MySQL database credentials and JWT secret

3. Start the server:
```bash
npm start
```

4. Access the API documentation:
- Open your browser and navigate to http://localhost:5000/api-docs

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Vehicles (Protected Routes)
- `GET /api/vehicles` - Get all vehicles (paginated)
- `GET /api/vehicles/:id` - Get a specific vehicle
- `POST /api/vehicles` - Add a new vehicle
- `PUT /api/vehicles/:id` - Update a vehicle
- `DELETE /api/vehicles/:id` - Delete a vehicle

## Testing
```bash
npm test
```

## Security Features
- Password hashing with bcrypt
- JWT authentication
- Input validation
- CORS configuration
- SQL injection prevention