# MindEase 🧠

> A modern mental health and journaling application designed to provide a safe space for self-reflection and mood tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_%2B_Vite-61DAFB)
![Node](https://img.shields.io/badge/backend-Node.js-339933)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248)

## 📖 Overview

MindEase is a full-stack MERN (MongoDB, Express, React, Node.js) application that helps users track their emotional well-being. It features a secure journaling interface, mood logging with visualization, and AI-driven insights to promote mental wellness.

### Key Features
- **📊 Mood Tracking**: Log daily moods and visualize trends over time.
- **📔 Private Journal**: Secure, rich-text editor for personal thoughts.
- **🤖 AI Insights**: Get therapeutic feedback and patterns from your entries.
- **🔒 Secure Authentication**: Robust user management and data privacy.
- **📱 Responsive Design**: Beautiful, calming UI built with Tailwind CSS and shadcn/ui.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM (SPA)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cache/Rate Limiting**: Redis (Upstash)
- **Security**: Helmet, CORS, JWT Authentication

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or local instance)
- Upstash Redis Account (optional, for rate limiting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhanushreddy370/mindease.git
   cd mindease
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend && npm install

   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   - Create `backend/.env` (see `backend/.env.example`)
   - Create `frontend/.env` (see `frontend/.env.example`)

4. **Run Locally**
   ```bash
   # Terminal 1: Start Backend (Port 3000)
   cd backend && npm run dev

   # Terminal 2: Start Frontend (Port 8080)
   cd frontend && npm run dev
   ```

---

## 📦 Deployment

This application is configured for easy deployment on **Vercel** (Frontend) and **Render** (Backend).

Please refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for a detailed, step-by-step deployment guide.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
