# 🐾 PawFinder – Pet Rescue & Tracking Platform

A full-stack MERN application that helps users report lost pets, track their pets, and connect with others to bring pets back home safely.

---

## 🚀 Features

### 👤 User Features

* Sign up & login (JWT authentication)
* Add pets with image, location, description & phone number
* Mark pets as **Lost / Found / Safe**
* View & manage **My Pets**
* Browse all **Lost Pets**
* Contact pet owners directly
* Receive notifications on status updates

---

### 🛡️ Admin Features

* View all pets in the system
* Mark any pet as **Lost / Found**
* Moderate user activity
* Receive system-wide notifications

---

### 🔔 Notifications System

* Notifications triggered when:

  * Pet is marked **Lost**
  * Pet is marked **Found**
* Works for both:

  * Users
  * Admin

---

## 🏗️ Tech Stack

### Frontend

* React (TypeScript)
* TanStack Router
* Tailwind CSS
* Axios
* ShadCN UI

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB (Mongoose)
* JWT Authentication
* Multer (Image Uploads)

---

## 📂 Project Structure

```
client/
  ├── components/
  ├── routes/
  ├── lib/
  └── pages/

server/
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  └── uploads/
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/pawfinder.git
cd pawfinder
```

---

### 2️⃣ Backend Setup

```
cd server
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
```

Run backend:

```
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:8080
```

---

## 📡 API Endpoints

### 🔐 Auth

* `POST /api/auth/signup`
* `POST /api/auth/login`
* `GET /api/auth/verify`
* `GET /api/auth/logout`

---

### 🐶 Pets

* `POST /api/pets` → Create pet
* `GET /api/pets/my` → Get user pets
* `GET /api/pets/lost` → Get lost pets
* `PUT /api/pets/:id` → Update pet
* `PUT /api/pets/:id/status` → Update status
* `DELETE /api/pets/:id` → Delete pet

---

### 🔔 Notifications

* `GET /api/notifications`
* `PUT /api/notifications/:id` → Mark as read

---

### 🛡️ Admin

* `GET /api/admin/pets`

---

## 🖼️ Image Upload

* Images are stored locally in:

```
/server/uploads
```

* Access via:

```
http://localhost:5000/uploads/<filename>
```

---

## 🧠 Key Concepts Implemented

* JWT Authentication with cookies
* Role-based access (User/Admin)
* File upload handling (Multer)
* REST API design
* Responsive UI (mobile + desktop)
* State management using React Context
* Notification system (polling)

---
