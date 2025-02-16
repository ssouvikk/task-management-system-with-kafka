# Task Management System

## Project Overview
The **Task Management System** is a powerful and scalable task management solution built with **Express.js**, **PostgreSQL**, **Kafka**, and **WebSockets**. It allows users to create, manage, and track tasks in real-time with notification support.

## Features
- **User Authentication**
  - User Registration & Login (JWT-based authentication)
  - Secure password hashing
  - Profile management (update username, email, password, and profile picture)
  
- **Task Management**
  - Create, update, delete tasks
  - Assign tasks to users
  - Track task status (To Do, In Progress, Done)
  - Filter and search tasks by priority, status, and due date

- **Real-time Notifications**
  - WebSocket-based real-time notifications for task updates
  - Kafka-based event-driven task management

- **Admin Features (Optional)**
  - Manage all users and tasks
  - View Kafka event logs
  - Broadcast system messages to users

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Node.js (>=16)
- Docker & Docker Compose
- PostgreSQL
- Kafka & Zookeeper

### Local Setup
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd task-management-backend
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Create a `.env` File** with the following configurations:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret
   DATABASE_URL=postgres://username:password@localhost:5432/taskdb
   KAFKA_BROKER=kafka:9092
   ```
4. **Run the Application**
   ```bash
   npm run dev
   ```
5. **Access API Documentation**
   Open `http://localhost:5000/api-docs` in your browser.

### Running with Docker
1. **Build and Start Services**
   ```bash
   docker-compose up --build
   ```
2. The backend, database, Kafka, and WebSockets will be running in Docker containers.

## API Documentation
For detailed API endpoints and usage, refer to the **Swagger API Documentation**:
```
http://localhost:5000/api-docs
```

## Deployment Instructions
### Deploying with Docker
1. **Build the Docker Image**
   ```bash
   docker build -t task-management-api .
   ```
2. **Run the Container**
   ```bash
   docker run -p 5000:5000 --env-file .env task-management-api
   ```

### Deploying to Cloud (e.g., AWS, DigitalOcean, Heroku)
- Use a managed PostgreSQL service.
- Deploy Kafka using a cloud provider like Confluent Cloud.
- Use CI/CD pipelines for automated deployment.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (TypeORM)
- **Message Broker:** Kafka
- **Real-time:** WebSockets
- **Authentication:** JWT (JSON Web Token)
- **Containerization:** Docker & Docker Compose

## License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---
Let me know if you need any changes or additions! 🚀
