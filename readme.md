# Express.js API Application

This project is an Express.js-based API server that supports user authentication, task management, and real-time notifications via WebSocket. It is deployed using Docker and integrates with PostgreSQL, Kafka, and Zookeeper.

## Features

- **User Authentication:**  
  - User registration (/api/auth/signup)
  - User login (/api/auth/login)
  - JWT token refresh (/api/auth/refresh-token)

- **Task Management:**  
  - Create, retrieve, update, and delete tasks (/api/tasks)

- **Notifications:**  
  - Real-time notifications via WebSocket (e.g., task status updates)
  - Simulate notifications through the API route (/simulate-task-update)

- **Swagger API Documentation:**  
  - View API documentation at `/api-docs`

## Project Structure

```
/backend
 ├── docs
 │     └── swagger.yaml         # Swagger API specification
 ├── src
 │     ├── controllers          # Controller files
 │     ├── models               # TypeORM entity files (User, Task, TaskHistory)
 │     ├── routes               # API route files (auth.routes.js, task.routes.ts)
 │     ├── services             # Kafka Consumer and other services
 │     ├── config               # Database, Kafka, and Socket client configuration
 │     └── server.js            # Application entry point
 ├── Dockerfile                 # Backend Dockerfile
 ├── package.json
 └── ...
```

## Installation & Configuration

### Running Locally

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install Node Packages:**

   ```bash
   npm install
   ```

3. **Create Environment Variables (.env):**

   Example configuration for the `.env` file:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   DATABASE_URL=postgres://myuser:mypassword@postgres:5432/mydb
   KAFKA_BROKER=kafka:9092
   ```

4. **View Swagger API Documentation:**

   Once the server is running, access API documentation in your browser:
   ```
   http://localhost:5000/api-docs
   ```

5. **Start the Server:**

   ```bash
   npm run dev
   ```

### Running with Docker

This project can be run using Docker Compose.

1. **Install Docker and Docker Compose:**  
   Ensure that Docker and Docker Compose are installed on your system.

2. **Start Docker Compose:**

   Navigate to the project root directory where `docker-compose.yml` is located and run:
   ```bash
   docker-compose up --build
   ```
   This will start PostgreSQL, Zookeeper, Kafka, the Backend (Express.js), and the Frontend (Next.js).

3. **Environment Variables & Volumes:**  
   - The `COPY` command in the Dockerfile ensures all code and the `docs` folder are included.
   - The `volumes` setup in the Docker Compose file ensures that code changes reflect in the container.

## Usage Guide

- **API Routes:**  
  - User authentication and task management endpoints are accessible via `/api/auth` and `/api/tasks`.
  
- **Swagger Documentation:**  
  - View API documentation at `/api-docs`.

- **Notification Simulation:**  
  - Send a POST request to `/simulate-task-update` to simulate a notification for a specific user.

## Troubleshooting & Tips

- **Swagger File Not Found Issue:**  
  - Ensure that `docs/swagger.yaml` is correctly placed and referenced in `server.js`. Example:
    ```javascript
    const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));
    ```

- **Kafka Warning Messages:**  
  - KafkaJS might display warnings regarding default partitioners. If needed, disable warnings by setting the environment variable:
    ```env
    KAFKAJS_NO_PARTITIONER_WARNING=1
    ```

- **Docker Volumes & Caching:**  
  - Ensure that Docker Volumes are set up correctly so that code changes reflect in the container.

## License

This project is distributed under the MIT License. For more details, refer to the `LICENSE` file (if available).

---

This README file provides all the necessary information about the application, installation guide, usage instructions, and troubleshooting tips. If you have any questions or need further assistance, feel free to reach out.

