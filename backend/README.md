# 🏥 MediCare Plus - Node.js, Express & MongoDB Backend API

Production-ready RESTful backend API for **MediCare Plus Hospital Management System** built with Node.js, Express.js, and MongoDB (Mongoose).

---

## 🚀 Core Features

- 🔐 **Authentication & Authorization (RBAC)**: JWT authentication with support for 3 roles (`admin`, `doctor`, `patient`). Password hashing via `bcryptjs`.
- 🩺 **Doctor Management**: Search & filter doctors by name or specialization, profile creation, qualification details, availability schedule, consultation fee, and rating aggregation.
- 🏥 **Services Management**: Healthcare category listings, service descriptions, and icon mappings.
- 📅 **Appointment System**: Patient booking workflow, doctor schedule assignment, status updates (`pending`, `approved`, `completed`, `cancelled`), and role-scoped lists.
- 📁 **Medical Reports**: PDF document upload for patient lab results & doctor consult summaries, secure file storage in `/uploads/reports`, and authorization-restricted file streaming.
- 💬 **Doctor-Patient Messaging**: Direct messaging inbox, unread counts, thread management, and attachment handling.
- ⭐ **Feedback & Rating System**: Patient reviews for doctors with automatic recalculation of doctor average ratings (`rating_avg`).
- 🌱 **Database Seeder**: Out-of-the-box demo data populator with pre-seeded Admin, Doctors, Patients, Services, and Appointments.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **File Uploads**: `multer`
- **Utility**: `cors`, `dotenv`, `nodemon`

---

## 📁 Directory Architecture

```
e:/Medi-care/
├── .env
├── .env.example
├── package.json
├── server.js
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Service.js
│   │   ├── Appointment.js
│   │   ├── MedicalReport.js
│   │   ├── Feedback.js
│   │   └── Message.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── doctorController.js
│   │   ├── serviceController.js
│   │   ├── appointmentController.js
│   │   ├── reportController.js
│   │   ├── feedbackController.js
│   │   └── messageController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── messageRoutes.js
│   └── utils/
│       └── seeder.js
└── uploads/
    ├── reports/
    ├── attachments/
    └── profiles/
```

---

## 🔑 Default Seed Credentials

After running `npm run seed`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@medicareplus.test` | `password123` |
| **Doctor** | `ozella@medicareplus.test` | `password123` |
| **Doctor** | `kelsi@medicareplus.test` | `password123` |
| **Patient** | `ollie@medicareplus.test` | `password123` |
| **Patient** | `grace@medicareplus.test` | `password123` |

---

## 📡 API Route Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (patient or doctor)
- `POST /api/auth/login` - Authenticate user & return JWT token
- `GET /api/auth/me` - Fetch profile of logged-in user
- `PUT /api/auth/profile` - Update profile details & avatar photo

### Users & Admin Dashboard (`/api/users`)
- `GET /api/users` - Admin: Get users list (filterable by role)
- `POST /api/users` - Admin: Create new user
- `GET /api/users/dashboard/stats` - System overview statistics (doctor count, patient count, appointments count, reports count)
- `GET /api/users/:id` - Admin: Get user details by ID
- `PUT /api/users/:id` - Admin: Update user record
- `DELETE /api/users/:id` - Admin: Remove user account

### Doctors (`/api/doctors`)
- `GET /api/doctors` - Public: List & search doctors (by query/specialization)
- `GET /api/doctors/:id` - Public: Detailed doctor profile
- `POST /api/doctors` - Admin: Add new doctor profile
- `PUT /api/doctors/:id` - Admin/Doctor: Update doctor profile
- `DELETE /api/doctors/:id` - Admin: Delete doctor profile

### Healthcare Services (`/api/services`)
- `GET /api/services` - Public: List services (optional category filter)
- `GET /api/services/:id` - Public: Get service details
- `POST /api/services` - Admin: Create new service
- `PUT /api/services/:id` - Admin: Update service
- `DELETE /api/services/:id` - Admin: Delete service

### Appointments (`/api/appointments`)
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Role-scoped appointments list (Patient sees own, Doctor sees assigned, Admin sees all)
- `GET /api/appointments/:id` - View appointment detail
- `PUT /api/appointments/:id/status` - Update status (`approved`, `completed`, `cancelled`)
- `DELETE /api/appointments/:id` - Cancel/Delete appointment

### Medical Reports (`/api/reports`)
- `POST /api/reports` - Doctor/Admin: Upload PDF medical report
- `GET /api/reports` - View reports (Patient sees own, Doctor sees uploaded/patient's, Admin sees all)
- `GET /api/reports/:id` - Get report metadata
- `GET /api/reports/:id/download` - Stream & download report document file
- `DELETE /api/reports/:id` - Doctor/Admin: Delete report

### Feedback & Ratings (`/api/feedback`)
- `POST /api/feedback` - Patient: Submit rating (1-5 stars) and review for a doctor
- `GET /api/feedback/doctor/:doctorId` - Public: Get feedback list for a doctor
- `GET /api/feedback` - Admin/Doctor: Get all feedback
- `DELETE /api/feedback/:id` - Admin: Delete feedback review

### Messaging (`/api/messages`)
- `POST /api/messages` - Send message (with optional file attachment)
- `GET /api/messages/conversations` - Active chat threads list with unread counts
- `GET /api/messages/conversation/:userId` - Message chat history with a user
- `PUT /api/messages/read/:senderId` - Mark conversation as read

---

## 🏃 Setup & Execution Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables** in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/medicare_plus
   JWT_SECRET=medicare_plus_super_secret_jwt_key_2026
   ```

3. **Seed database** with demo data:
   ```bash
   npm run seed
   ```

4. **Start the API server**:
   ```bash
   npm start
   # or development mode with live restart:
   npm run dev
   ```
