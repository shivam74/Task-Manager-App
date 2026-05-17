# Full Stack Task Management System

A production-ready Full Stack Task Management System built with React, Node.js, Express, MongoDB, and Socket.IO.

## Live Demo

* **Frontend:** [https://task-manager-app-inky-kappa.vercel.app/](https://task-manager-app-inky-kappa.vercel.app/)
* **Backend API:** [http://16.170.247.206:5000](http://16.170.247.206:5000)
* **Swagger API Docs:** [http://16.170.247.206:5000/api-docs](http://16.170.247.206:5000/api-docs)

## Features

* **Authentication & Authorization:** JWT-based auth with Role-Based Access Control (Admin/User).
* **Real-time Updates:** Instant UI updates when tasks are created, updated, or deleted using Socket.IO.
* **File Uploads:** Securely upload and view PDF documents up to 5MB using AWS S3.
* **Task Management:** Create, Read, Update, Delete tasks with statuses and priorities.
* **Filtering & Sorting:** Filter tasks by status, priority, and sort by various criteria.
* **Responsive UI:** Modern, clean, and responsive design using Tailwind CSS and Lucide React icons.

## Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, React Router DOM, React Hook Form + Zod, Context API, Socket.IO Client, Axios.
* **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, bcrypt, Multer, AWS S3 SDK.
* **Deployment:** Docker, Docker Compose.

## Prerequisites

* Docker & Docker Compose
* Node.js 18+ (for local development without Docker)

## Setup & Execution

### Using Docker Compose (Recommended)

1. Ensure the `docker-compose.yml` file has the correct AWS and MongoDB credentials configured in the environment variables.
2. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   * **Frontend:** `http://localhost:3000`
   * **Backend API:** `http://localhost:5000/api`
   * **Swagger API Docs:** `http://localhost:5000/api-docs`

### Local Development Setup

#### Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials.
4. `npm run dev`

#### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## API Documentation
The API is fully documented using Swagger OpenAPI. Once the backend is running, navigate to `http://localhost:5000/api-docs` to view and interact with the endpoints.

## Testing
To run the backend tests (Jest + Supertest):
```bash
cd backend
npm test
```
