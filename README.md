# HireMe

This is an application where users can register as company or developer and then companies can post job openings and developers can apply to them.

## Tech Stack

For the management I have used turborepo and the JavaScript runtime used is bun
To initialize a turborepo project -

```bash
bun create-turbo@latest <project name>
```

### Frontend -

In frontend I have used Nextjs with app router and shadcn ui for the ui library with tailwindcss
To set up a nextjs project with shadcn ui using bun you can use the following command -

```bash
# Nextjs project
bun create next-app <project name>

# shadcn
cd <project name>
bunx --bun shadcn@latest init --preset <preset code>
```

### Backend

In backend I have used nodejs and express as the backend framework, and I have used bullmq and redis with nodemailer for sending the verification emails during register.
I have made a REST APi with a controller-router pattern.

## Project Structure

```
hireme
├── apps
│   ├── backend
│   │   ├── drizzle
│   │   │   ├── 0000_complete_garia.sql
│   │   │   └── meta
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── config
│   │   │   ├── controllers
│   │   │   ├── db
│   │   │   ├── index.ts
│   │   │   ├── lib
│   │   │   ├── middleware
│   │   │   ├── queues
│   │   │   ├── routes
│   │   │   ├── utils
│   │   │   └── worker
│   │   └── tsconfig.json
│   └── frontend
│       ├── AGENTS.md
│       ├── CLAUDE.md
│       ├── components.json
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── next-env.d.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── public
│       │   ├── file.svg
│       │   ├── globe.svg
│       │   ├── next.svg
│       │   ├── vercel.svg
│       │   └── window.svg
│       ├── README.md
│       ├── src
│       │   ├── app
│       │   ├── components
│       │   ├── hooks
│       │   └── lib
│       ├── tsconfig.json
│       └── tsconfig.tsbuildinfo
├── bun.lock
├── docker-compose.yml
├── package.json
├── package-lock.json
├── packages
│   ├── eslint-config
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── package.json
│   │   ├── react-internal.js
│   │   └── README.md
│   ├── typescript-config
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── package.json
│   │   └── react-library.json
│   └── ui
│       ├── eslint.config.mjs
│       ├── package.json
│       ├── src
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   └── code.tsx
│       └── tsconfig.json
├── README.md
└── turbo.json
```

## Getting Started

### Prerequisites

- Bun v1.3.14
- Redis (for linux distributions)
  - for debian based distributions

  ```bash
  sudo apt install redis -y && sudo systemctl enable --now redis
  ```

  - for RHEL or fedora based distributions

  ```bash
  sudo dnf install redis -y && sudo systemctl enable --now redis
  ```

  - for Arch based distributions

  ```bash
  sudo pacman -S redis --no-confirm && sudo systemctl enable --now redis.service
  ```

For checking if redis is setup correctly or not -

```bash
redis-cli ping
```

and this command should output 'PONG'

You can also check using this command if it is running or not

```bash
sudo systemctl status redis.service
```

- PostgreSQL using NeonDB

### Setup

1. Clone the repo

```bash
git clone https://github.com/himanshu-tw/hireme.git
cd hireme
```

1. Install the dependencies

```bash
bun install
```

1. Setup environment variables
   - Copy `apps/backend/.env.example` to `apps/backend/.env` and fill in the values
   - Copy `apps/frontend/.env.example` to `apps/frontend/.env` and fill in the values

2. Run database migrations

```bash
cd apps/backend
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

1. Start the dev server

```bash
cd ../.. # to the root (hireme)
bun run dev # this will start both the frontend and the backend
```

## Environment Variables

### Backend

See `apps/backend/.env.example` — all variables are documented with instructions.

### Frontend

`NEXT_PUBLIC_API_URL` — backend URL (default: `http://localhost:8080`)

## API Endpoints

### Auth

| Method | Endpoint                  | Description       | Auth Required |
| ------ | ------------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register`      | Register new user | No            |
| POST   | `/api/auth/sign-in`       | Sign in           | No            |
| GET    | `/api/auth/verify?token=` | Verify email      | No            |
| GET    | `/api/auth/me`            | Get current user  | Yes           |
| POST   | `/api/auth/logout`        | Logout            | Yes           |

### Company

| Method | Endpoint                         | Description           | Auth Required |
| ------ | -------------------------------- | --------------------- | ------------- |
| GET    | `/api/company/profile`           | Get company profile   | Yes           |
| POST   | `/api/company/profile`           | Create new profile    | Yes           |
| POST   | `/api/company/jobs`              | Create new job        | Yes           |
| GET    | `/api/company/jobs`              | Get all jobs          | Yes           |
| PUT    | `/api/company/jobs/:jobId`       | Update job            | Yes           |
| PATCH  | `/api/company/job/:jobId/status` | Update the job status | Yes           |

### Developer

| Method | Endpoint                 | Description              | Auth Required |
| ------ | ------------------------ | ------------------------ | ------------- |
| GET    | `/api/developer/profile` | Get developer profile    | Yes           |
| POST   | `/api/developer/profile` | Create developer profile | Yes           |
| GET    | `/api/jobs`              | Get open jobs            | Yes           |
| POST   | `/api/jobs/:jobId/apply` | Apply to jobs            | Yes           |
| GET    | `/api/applications`      | Get applications         | Yes           |
