# ChatApp Backend

Welcome to the ChatApp Backend repository. This project provides the backend services for the ChatApp application.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Introduction

The ChatApp Backend is built using Node.js and Express. It handles user authentication, message routing, and real-time communication using WebSockets.

## Features

- User authentication and authorization
- Real-time messaging with WebSockets
- RESTful API for user and message management
- Scalable architecture

## Installation

To get started with the ChatApp Backend, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/chatapp-backend.git
    ```
2. Navigate to the project directory:
    ```sh
    cd chatapp-backend
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
4. Set up environment variables by creating a `.env` file:
    ```sh
    touch .env
    ```
    Add the following variables to the `.env` file:
    ```
    PORT=3000
    DATABASE_URL=your_database_url
    JWT_SECRET=your_jwt_secret
    GOOGLE_SECRET_KEY=your_google_secret_key
    GOOGLE_CLIENT_ID=your_google_client_id
    ```
5. Configure your database using prisma:
    ```sh
    npx prisma db push
    ```

## Usage

To start the server, run:
```sh
npm start
```
The server will be running on `http://localhost:3000`.

## API Endpoints

### Authentication

- `GET /logout` - Logout a user
- `GET /auth/google` - Google OAuth authentication

### Messages

- `WebSocket /api/messages` - WebSocket for message communication

### Users

- `GET /users` - Get all users
- `GET /users/:username` - Get user by username
- `POST /users` - Create a new user
- `DELETE /users/:username` - Delete a user by username


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.