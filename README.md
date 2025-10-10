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

To run linting and fix issues from the root directory:

- **Both projects**: `npm run lint` / `npm run lint:fix`
- **Backend only**: `npm run lint:backend`
- **Frontend only**: `npm run lint:frontend`

To run formatting and check formatting from the root directory:

- **Both projects**: `npm run format` / `npm run format:check`
- **Backend only**: `npm run format:backend`
- **Frontend only**: `npm run format:frontend`

To run tests from the root directory:

- **Both projects**: `npm test`
- **Backend only**: `npm run test:backend`
- **Frontend only**: `npm run test:frontend`

## Color Scheme

The application uses a consistent color scheme across both frontend and backend interfaces:

- **Primary Color:** #012d6c (Dark Blue)
- **Secondary Color:** #c51230 (Red)

These colors should be used project-wide for consistency.

## Security Considerations

### Production Deployment

- **Environment Variables**: Use strong, cryptographically secure values for `JWT_SECRET` and database credentials. Never use placeholder values like "your-secret-key" in production.
- **AWS Secrets Manager**: The backend automatically retrieves database credentials and JWT secrets from AWS Secrets Manager. Configure AWS credentials before deployment.
- **Code Review**: Before making the project public or deploying to production, audit all configuration files for hardcoded sensitive data including API keys, passwords, and personal information.

### Data Protection

- Sensitive data files (such as those in the `data/` directory) are excluded from version control via `.gitignore`.
- Environment files (`.env*`) are properly ignored to prevent accidental commits of secrets.

## Getting Started

### Local Development

1. Install all dependencies:

    ```bash
    npm run install:all
    ```

2. Set up AWS credentials and database secrets:

    ```bash
    cd backend
    npm run setup-db  # Fetches database URL from AWS Secrets Manager
    npx prisma migrate dev
    cd ..
    ```

3. Start both servers:

    ```bash
    npm start
    ```

    This will start both the backend GraphQL server (port 4000) and frontend dev server (port 5173), with the backend proxying frontend requests.

### Individual Server Development

- **Backend only**: `npm run dev:backend`
- **Frontend only**: `npm run dev:frontend`

### AWS Beanstalk Deployment

The application is configured to run both frontend and backend on a single Beanstalk environment:

1. The backend serves the GraphQL API at `/graphql`
2. All other requests are proxied to the frontend development server
3. Use `npm run build:backend` for production builds
4. The root `package.json` provides deployment scripts

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
