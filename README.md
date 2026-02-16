🏋️‍♂️ Home Workout Tracker

A simple and effective website designed for at-home workouts. It helps users follow structured workout intervals, track meals and workouts, and stay consistent using an interactive calendar and AI chatbot support.

🚀 Features

⏱️ Adjustable workout timer (1 min workout / 30 sec rest)

📅 Calendar view that automatically marks completed workouts and meals

📝 Workout and meal tracking

🤖 AI chatbot for guidance and motivation

🏠 Designed specifically for home workouts

🛠️ Tech Stack Overview
Frontend (my-project)
Core Framework & Language:

⚛️ React - UI library
📘 TypeScript - Type-safe JavaScript
⚡ Vite - Build tool and dev server

Routing:

🔀 React Router DOM - Client-side routing

State Management:

🔄 React Query (@tanstack/react-query) - Server state management
🎣 React Hooks - useState, useEffect, useNavigate

Styling:

🎨 Tailwind CSS - Utility-first CSS framework
✨ Custom CSS - Gradient backgrounds, animations
🌈 Glassmorphism effects - backdrop-blur, transparency

UI Components:

🎯 shadcn/ui - Pre-built components (Button, Toaster, Tooltip, etc.)
🔔 Sonner - Toast notifications
🎭 Lucide React - Icon library

HTTP Client:

📡 Axios - API requests to backend

Authentication:

🔐 localStorage - Token storage (JWT)
🔑 Supabase Auth (planned but not fully implemented)


Backend (fitness-backend)
Runtime & Language:

🟢 Node.js - JavaScript runtime
📘 TypeScript - Type-safe backend code

Framework:

🚂 Express.js - Web server framework

Database:

🐘 PostgreSQL - Relational database (via Supabase)
📦 node-postgres (pg) - PostgreSQL client

Authentication:

🔒 JWT (jsonwebtoken) - Token-based auth
🔐 bcryptjs - Password hashing

Security:

🛡️ Helmet - Security headers
🔗 CORS - Cross-origin resource sharing

AI/ML:

🦙 Ollama - Local LLM for chatbot
🤖 phi3:mini - AI model for fitness coaching
📝 OpenAI API (configured but using Ollama)

Dev Tools:

🔄 Nodemon - Auto-restart on file changes
🏗️ ts-node - Run TypeScript directly


Database & Backend Services
Database Host:

☁️ Supabase - PostgreSQL hosting
📊 Database Tables:

users, profiles
calorie_logs
workout_logs, exercise_sets
calendar_events
chat_messages



Database Features:

🔍 Indexes - Performance optimization
🔒 Row Level Security (RLS) - Data protection
⚡ Triggers - Auto-create profiles
