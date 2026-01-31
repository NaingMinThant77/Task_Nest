# Task-Nest

**Task-Nest** is a comprehensive user, role, and task management system built with NestJS. It features a robust Authentication and Authorization (RBAC) layer, integration with Cloudinary for file management, and a fully containerized environment.

---

## 🛠 Tech Stack

* **Framework:** NestJS
* **ORM:** Prisma (MySQL)
* **Validation:** Yup
* **Authentication:** JWT, Passport, Bcrypt
* **Caching:** Redis
* **Storage:** Cloudinary (for profile and task images)
* **DevOps:** Docker, Docker Compose

---

## 🚀 Getting Started

### Local Setup
1. **Install Dependencies**
   ```bash
   npm install

2. **Database Preparation**
   ```bash
   npx prisma generate npx prisma db seed

3. **Run Application**
   ```bash
   npm run start:dev

### Docker Setup
1. **To run the entire stack (App, MySQL, Redis) using Docker**
   ```bash
   docker compose up --build
   
---

## 📂 API Endpoints

### 👤 Users Management

Login, POST => http://localhost:4000/users/login

{
    "email": "admin@tuto.com",
    "password": "admin123"
}

Get Profile, GET => http://localhost:4000/users/me/profile

Get All Users, GET => http://localhost:4000/users

Get Single User by ID, GET => http://localhost:4000/users/1

Create or Register User, POST => http://localhost:4000/users

{
    "name": "Na Na",
    "email": "AA@gmail.com",
    "password": "Nmt123!@#"
}

Update User, PATCH => http://localhost:4000/users/2

{
    "name": "Naing AA"
}

Delete User, DELETE => http://localhost:4000/users/2

Upload Profile Image, POST => http://localhost:4000/users/upload-profile

-- Body => form-data => 
file - FILE

---

### 📝 Tasks Management

Get All Tasks, GET => http://localhost:4000/tasks

Create a Task POST => http://localhost:4000/tasks

-- Body => form-data => 
userId - 8
name - Upload Images for Tasks in Cloudinary
description - Please Complete the code review of the task management app
status - OPEN
files - 

Delete a Task, DELETE => http://localhost:4000/tasks/6

Update a Task, PATCH => http://localhost:4000/tasks/2

-- Body => form-data => 
status - CLOSE
files - FILES

Get Single Task, GET => http://localhost:3000/tasks/1

---

### 🔑 Roles & Permissions

Get All Roles, GET => http://localhost:4000/roles

Get Single Role, GET => http://localhost:4000/roles/1

Create a Role, POST => http://localhost:4000/roles

{
  "name": "MANAGER",
  "permission": [
    {
      "resource": "TASKS",
      "actions": ["READ", "UPDATE"]
    },
    {
      "resource": "USERS",
      "actions": ["READ"]
    }
  ]
}

Delete a Role, DELETE => http://localhost:4000/roles/3

Update a Role, PATCH => http://localhost:4000/roles/3

{
  "name": "Staff",
  "permission": [
    {
      "resource": "TASKS",
      "actions": ["READ", "UPDATE"]
    },
    {
      "resource": "USERS",
      "actions": ["READ"]
    }
  ]
}

---

### ENV Setup
1. ** All required env**
   
   ```bash
   DATABASE_URL="mysql://root:root@localhost:3306/table_name"
   My_JWT_SECRET=Abc123
   APP_URL=http://localhost:4000
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=4000
   NODE_ENV=production

   CLOUDINARY_CLOUD_NAME=cloudname
   CLOUDINARY_API_KEY=0123456789
   CLOUDINARY_API_SECRET=kabc123456788
