# FixItNow API Documentation

Welcome to the API documentation for **FixItNow**. This API handles authentication, service discovery, technician management, booking processing, payments, user reviews, and administrative operations.

**Base URL:** `https://fixitnow-one.vercel.app/api/` (configurable via `{{base-url}}`)

---

## 1. Authentication (`/api/auth`)

Endpoints for user registration, authentication, and user profile retrieval.

| Method | Endpoint             | Description                                                                 |
| :----- | :------------------- | :-------------------------------------------------------------------------- |
| `GET`  | `/`                  | **Test URL**: Health-check endpoint to verify server status.                |
| `POST` | `/api/auth/register` | **Register New User**: Create a new customer or technician account.         |
| `POST` | `/api/auth/login`    | **Login User**: Authenticate credentials and receive an access token.       |
| `GET`  | `/api/auth/me`       | **Get Current User**: Retrieve details of the currently authenticated user. |

---

## 2. Services & Technicians (`/api`)

Endpoints for exploring available services, categories, and technician profiles.

| Method | Endpoint               | Description                                                                                |
| :----- | :--------------------- | :----------------------------------------------------------------------------------------- |
| `GET`  | `/api/services`        | **Get All Services**: Fetch paginated services with price filters and sorting.             |
| `GET`  | `/api/technicians`     | **Get All Technicians**: List technicians filtered by skills, experience, and price range. |
| `GET`  | `/api/technicians/:id` | **Technician Profile**: Fetch public details for a specific technician.                    |
| `GET`  | `/api/categories`      | **Get All Categories**: Retrieve available service categories.                             |
| `POST` | `/api/services`        | **Create Service**: Add a new service offering to a category.                              |

---

## 3. Bookings (`/api/bookings`)

Endpoints for managing customer service bookings.

| Method | Endpoint            | Description                                                                         |
| :----- | :------------------ | :---------------------------------------------------------------------------------- |
| `POST` | `/api/bookings`     | **Create New Booking**: Schedule a service with a technician.                       |
| `GET`  | `/api/bookings`     | **Get User's Bookings**: List all bookings associated with the current user.        |
| `GET`  | `/api/bookings/:id` | **Get Booking Details**: Retrieve comprehensive information for a specific booking. |

---

## 4. Payments (`/api/payments`)

Endpoints to handle transaction processing and payment history.

| Method | Endpoint                | Description                                                                         |
| :----- | :---------------------- | :---------------------------------------------------------------------------------- |
| `POST` | `/api/payments/create`  | **Create Payment**: Initiate a payment session for a booking ID.                    |
| `POST` | `/api/payments/confirm` | **Confirm/Verify Payment**: Validate and finalize a transaction via transaction ID. |
| `GET`  | `/api/payments`         | **Payment History**: Fetch all payment transactions for the user.                   |
| `GET`  | `/api/payments/:id`     | **Get Payment Details**: View specific transaction records.                         |

---

## 5. Technician Portal (`/api/technician`)

Endpoints reserved for technician profile management and job handling.

| Method  | Endpoint                       | Description                                                                           |
| :------ | :----------------------------- | :------------------------------------------------------------------------------------ |
| `PUT`   | `/api/technician/profile`      | **Update Profile**: Modify bio, skills, hourly rate, and overall availability status. |
| `PUT`   | `/api/technician/availability` | **Update Availability Slots**: Update working time slots for specific days.           |
| `GET`   | `/api/technician/bookings`     | **Get Bookings**: Retrieve job requests assigned to the logged-in technician.         |
| `PATCH` | `/api/technician/bookings/:id` | **Update Booking Status**: Accept, reject, or complete assigned bookings.             |

---

## 6. Reviews (`/api/reviews`)

Endpoints for customer feedback and ratings.

| Method | Endpoint       | Description                                                             |
| :----- | :------------- | :---------------------------------------------------------------------- |
| `POST` | `/api/reviews` | **Create Review**: Submit a rating and comment for a completed booking. |

---

## 7. Admin (`/api/admin`)

Privileged administrative endpoints for managing platform resources and users.

| Method  | Endpoint                | Description                                                                            |
| :------ | :---------------------- | :------------------------------------------------------------------------------------- |
| `GET`   | `/api/admin/users`      | **Get All Users**: Retrieve a list of all registered platform users.                   |
| `PATCH` | `/api/admin/users/:id`  | **Update User Status**: Change user state (e.g., set status to `ACTIVE` or suspended). |
| `GET`   | `/api/admin/bookings`   | **Get All Bookings**: Overview of all platform bookings.                               |
| `GET`   | `/api/admin/categories` | **Get All Categories**: View administrative category settings.                         |
| `POST`  | `/api/admin/categories` | **Create Category**: Add a new global service category.                                |
