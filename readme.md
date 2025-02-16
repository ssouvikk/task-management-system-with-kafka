# Task Management System

## Project Overview

The **Task Management System** is a robust and scalable API built with **Express.js**. It provides a structured way to manage user authentication, task tracking, and real-time notifications using WebSockets. The application is containerized with **Docker** and integrated with **PostgreSQL**, **Kafka**, and **Zookeeper** to ensure high performance and reliability.

## Features

- **User Authentication:**
  - User registration (`/api/auth/signup`)
  - User login (`/api/auth/login`)
  - JWT-based authentication & token refresh (`/api/auth/refresh-token`)

- **Task Management:**
  - Create, retrieve, update, and delete tasks (`/api/tasks`)

- **Real-Time Notifications:**
  - WebSocket-based live updates for task status changes
  - Simulate notifications via API endpoint (`/simulate-task-update`)

- **API Documentation:**
  - Available via Swagger UI at `/api-docs`

## Installation & Setup

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or later)
- [Docker & Docker Compose](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Kafka & Zookeeper](https://kafka.apache.org/)

### Local Setup

1. **Clone the Repository:**
   ```sh
   git clone <repository-url>
   cd backend
   ```

2. **Install Dependencies:**
   ```sh
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file and configure the following:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   DATABASE_URL=postgres://user:password@localhost:5432/task_db
   KAFKA_BROKER=localhost:9092
   ```

4. **Start the Application:**
   ```sh
   npm run dev
   ```

5. **Access API Documentation:**
   Open in your browser:
   ```
   http://localhost:5000/api-docs
   ```

### Docker Deployment

1. **Build and Run Containers:**
   ```sh
   docker-compose up --build
   ```

2. **Verify Running Containers:**
   ```sh
   docker ps
   ```

3. **Access API & Services:**
   - API Base URL: `http://localhost:5000`
   - API Docs: `http://localhost:5000/api-docs`

## Deployment Instructions

To deploy the Task Management System in a production environment:

1. **Prepare the Server:**
   - Install Docker & Docker Compose
   - Configure firewall and expose necessary ports

2. **Clone the Repository & Set Up Environment:**
   ```sh
   git clone <repository-url>
   cd backend
   nano .env  # Update environment variables
   ```

3. **Run Application Using Docker:**
   ```sh
   docker-compose up --build -d
   ```

4. **Monitor Logs (Optional):**
   ```sh
   docker-compose logs -f
   ```

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Messaging & Streaming:** Kafka, Zookeeper
- **Authentication:** JWT
- **Real-Time Updates:** WebSockets
- **Containerization:** Docker, Docker Compose
- **Documentation:** Swagger

## License

This project is licensed under the [MIT License](LICENSE).

---

For any queries or contributions, feel free to raise an issue or submit a pull request!

