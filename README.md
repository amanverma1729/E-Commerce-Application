# Flash E-Commerce — Full-Stack Enterprise Platform

[![Java 17](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/)
[![Spring Boot 3.4](https://img.shields.io/badge/Spring_Boot-3.4-green.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-cyan.svg)](https://www.docker.com/)
[![Build Status](https://img.shields.io/badge/Tests-36%20Passed-brightgreen.svg)]()

**Flash E-Commerce** is a full-stack e-commerce platform designed and engineered to showcase real-world backend architecture, enterprise security patterns, and clean frontend integration for a Java Full-Stack developer portfolio.

---

## 🏛️ Architecture & Key Features

### Backend (Spring Boot 3.4 + Java 17)
* **Layered Architecture**: Strict separation of concerns (`Controller -> Service -> Repository -> Database`) with DTO encapsulation to avoid entity leakage.
* **Database & Migrations**: Schema controlled via **Flyway** (`V1` to `V7`) with indexed tables (`idx_products_category_price`, `idx_orders_user`, `idx_products_approved_available`).
* **Security & Authentication**: **Spring Security** with stateless **JWT Authentication**, BCrypt password hashing, refresh token rotation, and Role-Based Access Control (**RBAC**: `ROLE_USER`, `ROLE_SELLER`, `ROLE_ADMIN`).
* **Catalog Discovery**: Server-side pagination (`Pageable`), sorting, and multi-criteria specification filtering (`JpaSpecificationExecutor`) by search name, category, and price range.
* **E-Commerce Transaction Workflow**: Transactional checkout (`@Transactional`) enforcing stock validation, inventory reservation, order price snapshotting, mock payment handling, and idempotency key checks.
* **Observability & Health**: Spring Boot **Actuator** (`/actuator/health`, `/actuator/metrics`) and structured **SLF4J** logging.
* **API Documentation**: **OpenAPI 3.0 / Swagger UI** at `/swagger-ui.html`.

### Frontend (React 18 + Vite)
* **Centralized API Client**: Custom `apiClient.js` based on **Axios** with request interceptors for JWT injection and automated 401 token refresh handling.
* **Responsive UI**: Modern aesthetic with glassmorphism, toast notifications (`react-hot-toast`), and responsive CSS modules.

---

## 📂 Project Structure

```text
e-commerce/
├── backend/                      # Spring Boot REST Application
│   ├── src/main/java/com/ecommerce/com/ecommerce/flash/
│   │   ├── config/              # Security & Web Configuration
│   │   ├── controller/          # REST Controllers (/api/v1/)
│   │   ├── dto/                 # Request & Response Data Transfer Objects
│   │   ├── entity/              # JPA Domain Entities
│   │   ├── exception/           # Global Exception Handling & Handlers
│   │   ├── repository/          # Spring Data JPA Repositories
│   │   ├── security/            # JWT Token Provider & Filters
│   │   └── service/             # Business Logic & Service Implementations
│   ├── src/main/resources/
│   │   ├── db/migration/        # Flyway Database Migrations (V1..V7)
│   │   └── application.properties
│   ├── Dockerfile               # Multi-stage Maven/Java Dockerfile
│   └── pom.xml
├── frontend/                     # React + Vite Frontend Application
│   ├── src/
│   │   ├── api/apiClient.js     # Centralized Axios Client & Interceptors
│   │   ├── components/          # Reusable UI Components
│   │   └── pages/               # Application Pages (Storefront, Cart, Orders, Admin)
│   ├── Dockerfile               # Multi-stage Node/Nginx Dockerfile
│   └── nginx.conf               # Nginx SPA Router Configuration
├── .github/workflows/ci.yml      # GitHub Actions CI Workflow
├── docker-compose.yml            # Multi-container orchestration (MySQL + Backend + Frontend)
└── README.md
```

---

## ⚡ Quick Start

### Option 1: Running via Docker Compose (Recommended)

1. Ensure **Docker Desktop** is installed and running.
2. Clone the repository and navigate to the project root:
   ```bash
   cd e-commerce
   ```
3. Launch all services (MySQL, Spring Boot Backend, Nginx Frontend):
   ```bash
   docker-compose up --build -d
   ```
4. Access applications:
   * **Frontend Application**: `http://localhost`
   * **Backend REST API**: `http://localhost:9090/api/v1`
   * **Swagger API Documentation**: `http://localhost:9090/swagger-ui.html`
   * **Actuator Health Endpoint**: `http://localhost:9090/actuator/health`

---

### Option 2: Local Manual Setup

#### Prerequisites
* **Java 17+** & **Maven 3.8+**
* **Node.js 18+** & **npm**
* **MySQL 8.0** server running on port `3306`

#### 1. Backend Setup
1. Create the MySQL database:
   ```sql
   CREATE DATABASE IF NOT EXISTS ecommerce_db;
   ```
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Run automated test suite:
   ```bash
   mvn clean test
   ```
4. Start Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

#### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
4. Open browser at `http://localhost:5173`.

---

## 🧪 Automated Testing

The backend includes comprehensive automated unit, service, integration, and security tests.

```bash
cd backend
mvn clean test
```

### Verified Test Areas:
* **Authentication & JWT**: User/Seller/Admin login, registration, BCrypt password migration, refresh token generation.
* **Role-Based Security**: RBAC checks preventing unauthorized customer access to seller/admin endpoints.
* **Resource Ownership**: Customer data isolation and seller product boundary enforcement.
* **Cart & Checkout**: Stock deduction, idempotency handling, empty cart validation, price snapshots.
* **Product Search & Filtering**: JPA Specification filtering and server-side pagination.

---

## 🌐 API Overview (`/api/v1/`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT access/refresh tokens |
| `POST` | `/api/v1/auth/register` | Public | Register new customer account |
| `POST` | `/api/v1/auth/seller/register` | Public | Register new seller account |
| `POST` | `/api/v1/auth/refresh` | Public | Generate new access token using refresh token |
| `GET` | `/api/v1/products` | Public | List approved products with pagination, search & filter |
| `GET` | `/api/v1/products/{id}` | Public | Get product details by ID |
| `POST` | `/api/v1/products` | `SELLER`, `ADMIN` | Create new product listing (default status `PENDING`) |
| `PUT` | `/api/v1/products/{id}/approve` | `ADMIN` | Approve seller product for storefront visibility |
| `POST` | `/api/v1/cart/items` | `USER` | Add item to shopping cart |
| `GET` | `/api/v1/cart` | `USER` | Get authenticated user's shopping cart |
| `POST` | `/api/v1/orders/checkout` | `USER` | Checkout cart with idempotency check & transaction handling |
| `GET` | `/api/v1/orders/user/{userId}` | `USER`, `ADMIN` | Retrieve order history for user |
| `PUT` | `/api/v1/orders/{id}` | `SELLER`, `ADMIN` | Update order fulfillment status (`SHIPPED`, `DELIVERED`, `CANCELLED`) |

---

## 📜 License
Developed for portfolio & full-stack Java engineering demonstrations.
