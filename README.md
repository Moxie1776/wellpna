# WellPNA (Well Plug and Abandonment)

## Overview

WellPNA (Well Plug & Abandon) is used to import existing pdf files from Texas and New Mexico oil and gas commissions, extract well data, store it in a database, create wellbore diagrams, and eventual automated bidding.

It aims to streamline the process of bidding and creating well plans by providing a user-friendly interface and robust backend services. The application will create automatic wellbore diagrams based on the imported data, allowing users customize the data, visualize well trajectories and other relevant information.

After the initial phase, the application will be extended to include features for automated bidding based on the well data and user-defined criteria.

## Project Structure

This project is organized into three main directories:

### Root (`/`)

- **README.md**: This overview document
- **wellpna.code-workspace**: VS Code workspace configuration
- **INTEGRATION_TESTING.md**: Integration testing guidelines
- **PROJECT_OUTLINE.md**: High-level project planning and roadmap

### Backend (`/backend`)

The backend is a Node.js/TypeScript application that provides the data processing, storage, and API services for the system.

**Purpose:**
- Data ingestion from PDF and Excel files (examples in `backend/data/`)
- Database storage and management (SQLite with Prisma)
- GraphQL API for frontend consumption
- Data parsing and extraction from files
- Export PDF and Excel reports
- User authentication with JWT

**Major Libraries Used:**
- Node.js - JavaScript runtime
- TypeScript - Type safety
- Prisma - Database ORM
- GraphQL Yoga - GraphQL server
- Pothos - Code-first GraphQL schema builder
- bcryptjs - Password hashing
- jsonwebtoken - JWT handling
- nodemailer - Email sending
- winston - Logging

For detailed backend structure and development guidelines, see [backend/README.md](backend/README.md).

### Frontend (`/frontend`)

The frontend is a React application that provides the user interface for data visualization and management.

**Purpose:**
- User authentication interface integrated with backend GraphQL API
- Dashboard for viewing well data
- Wellbore diagram generation and visualization
- Data management interfaces for wells and related entities
- Import/export PDF and Excel files
- Generate ad-hoc WBD's (Wellbore Diagrams) in SVG/PDF format

**Major Libraries Used:**
- React - UI library
- TypeScript - Type safety
- urql - GraphQL client
- Joy UI - Component library for accessible interfaces
- React Router - Routing
- Zustand - State management
- React Hook Form - Form handling
- Zod - Schema validation
- Jest + React Testing Library - Testing

For detailed frontend structure and development guidelines, see [frontend/README.md](frontend/README.md).

## Code Quality and Linting

Both the backend and frontend projects are configured with ESLint and Prettier to maintain code quality and consistency.

- **ESLint:** Used for static code analysis to identify problematic patterns and enforce coding style.
  - Configuration files: `backend/eslint.config.js` and `frontend/eslint.config.js`
  - Ignore files: `backend/.eslintignore` and `frontend/.eslintignore`

- **Prettier:** Used for code formatting to ensure consistent code style.
  - Configuration files: `backend/.prettierrc` and `frontend/.prettierrc`

To run linting and fix issues:

- **Backend:**
  - `npm run lint`
  - `npm run lint:fix`
- **Frontend:**
  - `npm run lint`
  - `npm run lint:fix`

To run formatting and check formatting:

- **Backend:**
  - `npm run format`
  - `npm run format:check`
- **Frontend:**
  - `npm run format`
  - `npm run format:check`

## Color Scheme

The application uses a consistent color scheme across both frontend and backend interfaces:

- **Primary Color:** #012d6c (Dark Blue)
- **Secondary Color:** #c51230 (Red)

These colors should be used project-wide for consistency.

## Getting Started

1. Set up the backend:
   - Navigate to the `backend` directory
   - Install dependencies: `npm install`
   - Set up the database: `npx prisma migrate dev`
   - Start the server: `npm run dev`

2. Set up the frontend:
   - Navigate to the `frontend` directory
   - Install dependencies: `npm install`
   - Start the development server: `npm run dev`

## Development

Both the backend and frontend use TypeScript for type safety and modern JavaScript features. The project follows standard conventions for Node.js and React development.

## Project Progression

The development will follow this general progression:

- Setup testing along the way with each phase in both the backend and frontend
- User authentication / management
- Analyzing the pdf document and excel files
  - Creating CRUD to handle managing this data
  - Create webpages for managing it
- Implement datamining of these documents
  - Automated DB population
- Creating automated WBD's (Wellbore Diagrams)
- Add surveys and wellbore trajectories that include graphing where the producing and plugged regions are
