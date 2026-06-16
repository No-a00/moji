# Moji - Real-time Chat Application
**Moji** is a full-stack real-time messaging application built with Next.js and Node.js. This project features a robust authentication system using JWT and cookies, a comprehensive friend management system, and structured conversation handling.

---

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Authentication**: JSON Web Tokens (JWT), Access & Refresh Token logic, HttpOnly Cookies
- **Middleware**: CORS, Cookie-parser, Custom Auth Guards
- **API Testing**: Postman

---

## Features

###  Authentication
- **Secure Sign Up/In**: User registration and login with structured validation.
- **Session Management**: Implementation of Refresh Tokens and `AuthMe` checks to maintain user sessions securely.
- **Protected Routes**: Custom `protectedRoute` middleware to secure private API endpoints.

###  Friend System
- **Friend Requests**: Send, accept, or decline friend invitations.
- **Friend Management**: View all friends and pending friend requests.
- **Security**: `CheckFriendship` middleware to ensure privacy between users.

### Messaging & Conversations
- **Direct Messaging**: One-on-one private chat functionality.
- **Group Messaging**: Support for group-based communication with membership checks.
- **Conversation Tracking**: Create and retrieve conversation history and specific message logs.

---

## 📂 Project Structure

```text
/backend
├── src
│   ├── controllers     # authController, friendController, messageController,convarsationControllers,userControllers
│   ├── middlewares     # authMiddleware, friendMiddlewares (CheckFriendship)
│   ├── router          # authRouter, friendRoute, messageRoute, conversationRoute
│   └── index.js        # Express app configuration and entry point
/frontend
├── components          # UI Components (Sidebar, Chat Window, Buttons)
├── pages               # Next.js pages and routing logic
└── public              # Static assets
