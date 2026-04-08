# Neighborhood Skill Exchange Platform

A full-stack web application that connects neighbors to share and learn skills from each other. Users can offer skills they know, request skills they want to learn, schedule exchanges, and leave feedback for each other.

## Features

- **Skill Library** — Browse and contribute to a community catalog of skills organized by category
- **User Skills** — Add skills to your profile as Offering or Wanted, with proficiency levels
- **Skill Requests** — Send requests to skill providers in your community
- **Skill Exchanges** — Schedule and manage exchange sessions between users
- **Feedback & Ratings** — Leave reviews after exchanges; overall ratings calculated automatically
- **Messaging** — Real-time-like conversation system between exchange partners
- **Authentication** — Secure JWT-based registration and login

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Axios, Tailwind CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| DevOps | Docker, Docker Compose |

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB 6 (local) **or** Docker

## Setup Without Docker

### 1. Clone and install

```bash
git clone <repo-url>
cd skill-exchange-platform
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env if your API URL differs
npm install
npm start
```

The app will open at `http://localhost:3000`.

## Setup With Docker

```bash
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Current user | Yes |
| PUT | `/api/auth/profile` | Update bio/role | Yes |
| GET | `/api/skills/library` | List all library skills | Yes |
| POST | `/api/skills/library` | Add skill to library | Yes |
| GET | `/api/skills/user` | My skills | Yes |
| POST | `/api/skills/user` | Add skill to profile | Yes |
| DELETE | `/api/skills/user/:id` | Remove my skill | Yes |
| GET | `/api/requests` | My requests (sent & received) | Yes |
| POST | `/api/requests` | Create request | Yes |
| PUT | `/api/requests/:id` | Accept / Reject request | Yes |
| GET | `/api/exchanges` | My exchanges | Yes |
| POST | `/api/exchanges` | Create exchange | Yes |
| PUT | `/api/exchanges/:id/complete` | Mark complete | Yes |
| GET | `/api/feedback/:exchangeId` | Get feedback for exchange | Yes |
| POST | `/api/feedback` | Submit feedback | Yes |
| GET | `/api/messages/:userId` | Get conversation | Yes |
| POST | `/api/messages` | Send message | Yes |
| PUT | `/api/messages/:userId/read` | Mark messages as read | Yes |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/skill-exchange` |
| `JWT_SECRET` | Secret for signing JWTs | *(required)* |
| `JWT_EXPIRE` | Token expiry | `30d` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
