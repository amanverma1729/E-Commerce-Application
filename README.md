# E-Commerce Application (Full-Stack)

A complete full-stack E-Commerce application with a **Spring Boot** backend and a **React + Vite** frontend.

## Project Structure

```
d:/011/e-commerce/
├── backend/                # Spring Boot REST API (Port 9090)
│   ├── src/
│   │   ├── main/java/      # Controllers, Entities, Repositories, DAOs
│   │   └── main/resources/ # application.properties
│   ├── e-commerce.sql      # Database schema / initial seed script
│   ├── pom.xml             # Maven dependencies
│   └── mvnw / mvnw.cmd     # Maven wrapper
└── frontend/               # React + Vite UI (Port 5173 / 5174)
    ├── src/                # Components, Pages, Router
    ├── package.json        # Frontend dependencies
    └── vite.config.js      # Vite build configuration
```

---

## Getting Started

### 1. Prerequisites
- **Java 17+**
- **Node.js 18+** & `npm`
- **MySQL Database** (Default database: `e-commerce` on `localhost:3306`)

---

### 2. Backend Setup (Spring Boot)

1. Open terminal in the `backend` directory:
   ```bash
   cd e-commerce/backend
   ```
2. Start MySQL server and create the database (if not automatically created):
   ```sql
   CREATE DATABASE IF NOT EXISTS `e-commerce`;
   ```
   *Optional:* Import `e-commerce.sql` for initial seed data.

3. Run the Spring Boot backend:
   - On Windows:
     ```cmd
     .\mvnw spring-boot:run
     ```
   - On Linux/macOS:
     ```bash
     ./mvnw spring-boot:run
     ```
4. Backend API will run on `http://localhost:9090`. Swagger OpenAPI docs available at `http://localhost:9090/swagger-ui.html`.

---

### 3. Frontend Setup (React + Vite)

1. Open terminal in the `frontend` directory:
   ```bash
   cd e-commerce/frontend
   ```
2. Install dependencies (if needed):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the web application at `http://localhost:5173` (or `http://localhost:5174`).

---

## Features
- **User Authentication**: Login and Signup for Users, Product Owners, and Admins.
- **Product Management**: View, add, update, and manage products.
- **Shopping Cart & Checkout**: Interactive product browsing, cart management, and order placement.
- **Admin Dashboard**: Comprehensive management of users, owners, and orders.
