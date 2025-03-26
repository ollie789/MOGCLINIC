# Back Pain Clinic Dashboard

A modern web application for managing back pain clinic operations, including patient assessments, appointments, and medical records.

## Features

- Secure doctor authentication
- Patient assessment management
- Appointment scheduling
- Medical condition tracking
- Pain level monitoring
- Direct database access for troubleshooting

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MongoDB Atlas
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ollie789/MOGCLINIC.git
cd MOGCLINIC
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
   - Create `.env` file in the server directory
   - Add your MongoDB connection string and JWT secret:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5003
```

4. Start the development servers:
```bash
# Start the backend server (from server directory)
npm run dev

# Start the frontend development server (from client directory)
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5003

## Development

- Frontend code is in the `client` directory
- Backend code is in the `server` directory
- API documentation is available at `/api/docs` when running the server

## License

This project is licensed under the MIT License - see the LICENSE file for details.
