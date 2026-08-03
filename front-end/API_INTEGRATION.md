# FixItNow API Documentation

Welcome to the API documentation for **FixItNow**. This API handles authentication, service discovery, technician management, booking processing, payments, user reviews, and administrative operations.

**Base URL:** `https://fixitnow-one.vercel.app/api/` (configurable via `{{base-url}}`)

---

## 1. Authentication (`/auth`)

Endpoints for user registration, authentication, and user profile retrieval.

| Method | Endpoint         | Description                                                                 |
| :----- | :--------------- | :-------------------------------------------------------------------------- |
| `GET`  | `/`              | **Test URL**: Health-check endpoint to verify server status.                |
| `POST` | `/auth/register` | **Register New User**: Create a new customer or technician account.         |
| `POST` | `/auth/login`    | **Login User**: Authenticate credentials and receive an access token.       |
| `GET`  | `/auth/me`       | **Get Current User**: Retrieve details of the currently authenticated user. |

---

## 2. Services & Technicians (``)

Endpoints for exploring available services, categories, and technician profiles.

| Method | Endpoint           | Description                                                                                |
| :----- | :----------------- | :----------------------------------------------------------------------------------------- |
| `GET`  | `/services`        | **Get All Services**: Fetch paginated services with price filters and sorting.             |
| `GET`  | `/technicians`     | **Get All Technicians**: List technicians filtered by skills, experience, and price range. |
| `GET`  | `/technicians/:id` | **Technician Profile**: Fetch public details for a specific technician.                    |
| `GET`  | `/categories`      | **Get All Categories**: Retrieve available service categories.                             |
| `POST` | `/services`        | **Create Service**: Add a new service offering to a category.                              |

---

## 3. Bookings (`/bookings`)

Endpoints for managing customer service bookings.

| Method | Endpoint        | Description                                                                         |
| :----- | :-------------- | :---------------------------------------------------------------------------------- |
| `POST` | `/bookings`     | **Create New Booking**: Schedule a service with a technician.                       |
| `GET`  | `/bookings`     | **Get User's Bookings**: List all bookings associated with the current user.        |
| `GET`  | `/bookings/:id` | **Get Booking Details**: Retrieve comprehensive information for a specific booking. |

---

## 4. Payments (`/payments`)

Endpoints to handle transaction processing and payment history.

| Method | Endpoint            | Description                                                                         |
| :----- | :------------------ | :---------------------------------------------------------------------------------- |
| `POST` | `/payments/create`  | **Create Payment**: Initiate a payment session for a booking ID.                    |
| `POST` | `/payments/confirm` | **Confirm/Verify Payment**: Validate and finalize a transaction via transaction ID. |
| `GET`  | `/payments`         | **Payment History**: Fetch all payment transactions for the user.                   |
| `GET`  | `/payments/:id`     | **Get Payment Details**: View specific transaction records.                         |

---

## 5. Technician Portal (`/technician`)

Endpoints reserved for technician profile management and job handling.

| Method  | Endpoint                   | Description                                                                           |
| :------ | :------------------------- | :------------------------------------------------------------------------------------ |
| `PUT`   | `/technician/profile`      | **Update Profile**: Modify bio, skills, hourly rate, and overall availability status. |
| `PUT`   | `/technician/availability` | **Update Availability Slots**: Update working time slots for specific days.           |
| `GET`   | `/technician/bookings`     | **Get Bookings**: Retrieve job requests assigned to the logged-in technician.         |
| `PATCH` | `/technician/bookings/:id` | **Update Booking Status**: Accept, reject, or complete assigned bookings.             |

---

## 6. Reviews (`/reviews`)

Endpoints for customer feedback and ratings.

| Method | Endpoint   | Description                                                             |
| :----- | :--------- | :---------------------------------------------------------------------- |
| `POST` | `/reviews` | **Create Review**: Submit a rating and comment for a completed booking. |

---

## 7. Admin (`/admin`)

Privileged administrative endpoints for managing platform resources and users.

| Method  | Endpoint            | Description                                                                            |
| :------ | :------------------ | :------------------------------------------------------------------------------------- |
| `GET`   | `/admin/users`      | **Get All Users**: Retrieve a list of all registered platform users.                   |
| `PATCH` | `/admin/users/:id`  | **Update User Status**: Change user state (e.g., set status to `ACTIVE` or suspended). |
| `GET`   | `/admin/bookings`   | **Get All Bookings**: Overview of all platform bookings.                               |
| `GET`   | `/admin/categories` | **Get All Categories**: View administrative category settings.                         |
| `POST`  | `/admin/categories` | **Create Category**: Add a new global service category.                                |
