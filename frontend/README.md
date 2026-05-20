# D&D Character Vault — Frontend

React + Vite frontend for the D&D Character Sheet application.

## Tech Stack

| Library               | Purpose                         |
| --------------------- | ------------------------------- |
| `react`               | UI framework                    |
| `react-router-dom`    | Client-side routing             |
| `react-hook-form`     | Form state management           |
| `zod`                 | Form validation schema          |
| `@hookform/resolvers` | Connects Zod to React Hook Form |
| `axios`               | HTTP client for API calls       |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

App will run at `http://localhost:5173`

> Make sure the backend server is also running at `http://localhost:8000`

## Pages

| Route                  | Description                                 |
| ---------------------- | ------------------------------------------- |
| `/login`               | Login page                                  |
| `/register`            | Create account page                         |
| `/dashboard`           | View all your characters                    |
| `/characters/new`      | Create a new character                      |
| `/characters/:id`      | View character sheet + live session tracker |
| `/characters/:id/edit` | Edit a character                            |

## Advanced Feature

The character detail page includes a **Live Session Tracker** that lets you:

- Deal damage or heal your character with +/− controls
- Track temporary HP
- Track death saving throws (successes and failures)

All stat changes are saved immediately to the database via `PATCH /characters/:id/stats` without requiring a full form submission — perfect for use during an actual D&D session.
