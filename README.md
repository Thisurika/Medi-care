# Medi-care

A modern healthcare management system that connects **Patients**, **Doctors**, and **Administrators** in one platform. Medicare simplifies appointment scheduling, medical record management, prescriptions, and medicine reminders while providing an efficient healthcare experience.

---

## 📖 Overview

Medicare is a full-stack healthcare management web application designed to improve communication between patients and healthcare providers.

The system allows patients to book appointments, doctors to manage consultations and upload medical records, and administrators to oversee the entire platform.

---

# ✨ Features

## 👤 Authentication

- Secure Login
- Patient Registration
- Doctor Registration
- Role-Based Authentication
- Password Encryption
- Forgot Password *(Optional)*

---

## 🧑 Patient Features

- Register/Login
- Edit Profile
- Search Doctors
- View Doctor Profiles
- Filter Doctors by Specialty
- Book Appointments
- Cancel Appointments
- Reschedule Appointments
- View Appointment History
- Download Medical Reports
- View Prescriptions
- View Medical History
- Receive Notifications
- Rate & Review Doctors
- Medicine Reminder
- Mark Medicine as Taken
- View Missed Medicines

---

## 👨‍⚕️ Doctor Features

- Register/Login
- Edit Profile
- Manage Availability
- Accept Appointments
- Reject Appointments
- Reschedule Appointments
- View Patient Details
- Upload Medical Reports
- Create Digital Prescriptions
- Add Consultation Notes
- View Appointment History
- Notifications

---

## 👨‍💼 Admin Features

- Dashboard
- Manage Doctors
- Manage Patients
- Manage Appointments
- View Reports
- User Management
- System Analytics
- Department Management

---

## 💊 Medicine Reminder

Patients receive reminders based on prescriptions created by doctors.

Features include:

- Daily Medicine Schedule
- Morning/Afternoon/Night Reminders
- Mark as Taken
- Skip Reminder
- Medicine History
- Missed Medicines Tracking

---

## 📁 Medical Records

Doctors can upload:

- Blood Reports
- X-Ray Reports
- MRI Reports
- ECG Reports
- CT Scan Reports
- Prescriptions
- Consultation Notes

Patients can:

- View Reports
- Download Reports
- Access Medical History

---

## 🔔 Notification System

Patients receive notifications for:

- Appointment Approved
- Appointment Rejected
- Appointment Reminder
- New Medical Report
- New Prescription
- Medicine Reminder

Doctors receive notifications for:

- New Appointment
- Appointment Cancellation
- Patient Updates

---

## ⭐ Review System

Patients can

- Rate Doctors
- Write Reviews
- View Previous Reviews

---

# 🛠 Technology Stack

### Frontend

- React.js
- HTML5
- CSS3
- JavaScript
- Bootstrap / Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB

### Authentication

- JWT Authentication
- bcrypt

### File Storage

- Cloudinary *(Optional)*

### Notifications

- Email Notifications
- Browser Notifications

---

# 📂 Project Structure

```
Medicare/

│── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
│── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── uploads/
│   └── package.json
│
│── README.md
│── .gitignore
│── package.json
```

---

# 🚀 Getting Started

## Prerequisites

Before starting, install:

- Node.js
- npm
- MongoDB
- Git

---

## Installation

### Clone the repository

```bash
git clone https://github.com/your-username/medicare.git
```

Go into the project

```bash
cd medicare
```

---

## Install Frontend

```bash
cd client

npm install
```

---

## Install Backend

```bash
cd ../server

npm install
```

---

# ⚙ Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email

EMAIL_PASSWORD=your_password

CLOUDINARY_NAME=your_cloudinary_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_SECRET=your_api_secret
```

---

# ▶ Running the Project

### Start Backend

```bash
cd server

npm run dev
```

---

### Start Frontend

```bash
cd client

npm start
```

---

Open your browser

```
http://localhost:3000
```

Backend

```
http://localhost:5000
```

---

# 📌 User Roles

## Patient

- Book appointments
- View reports
- View prescriptions
- Receive reminders
- Download reports

---

## Doctor

- Accept appointments
- Upload reports
- Create prescriptions
- Manage schedule

---

## Admin

- Manage users
- View analytics
- Manage appointments

---

# 📷 Screenshots

Add screenshots here.

Example:

```
screenshots/

login.png

dashboard.png

appointment.png

doctor-dashboard.png

medicine-reminder.png
```

---

# 🤝 Contributing

We welcome contributions to improve Medicare!

## Fork the Repository

Click the **Fork** button on GitHub.

---

## Clone Your Fork

```bash
git clone https://github.com/your-username/medicare.git
```

---

## Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

---

## Make Your Changes

Implement your feature or bug fix.

---

## Commit Your Changes

```bash
git add .

git commit -m "Add your feature"
```

---

## Push Your Branch

```bash
git push origin feature/your-feature-name
```

---

## Open a Pull Request

Create a Pull Request describing your changes.

---

# 🐞 Reporting Issues

If you find a bug, please open an issue and include:

- Bug description
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

---

# 💡 Future Improvements

- Video Consultation
- AI Symptom Checker
- Online Payments
- Pharmacy Module
- Lab Management
- SMS Notifications
- Mobile Application
- Emergency SOS
- Wearable Device Integration
- Multi-language Support

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Authors

Developed with ❤️ by the Medicare Development Team.

---

## 🌟 Support

If you like this project, don't forget to ⭐ the repository on GitHub!
