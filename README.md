# WellPNA (Well Plug and Abandonment)

## Overview

WellPNA (Well Plug & Abandon) is used to import existing pdf files from Texas and New Mexico oil and gas commissions, extract well data, store it in a database, create wellbore diagrams, and eventual automated bidding.

It aims to streamline the process of bidding and creating well plans by providing a user-friendly interface and robust backend services. The application will create automatic wellbore diagrams based on the imported data, allowing users customize the data, visualize well trajectories and other relevant information.

After the initial phase, the application will be extended to include features for automated bidding based on the well data and user-defined criteria.

## Project Structure

This project is organized into two main subdirectories:

### Backend (`/backend`)

The backend is a Node.js/TypeScript application that provides the data processing, storage, and API services for the system.

**Purpose:**

- Data ingestion from PDF and Excel files
  - Example pdf and excel files exist in `backend/data/`
- Database storage and management
- GraphQL API for frontend consumption
- Data parsing and extraction from files
- Export pdf and excel reports
- User authentication

**Major Libraries Used:**

- Node.js - JavaScript runtime
- TypeScript - Type safety for JavaScript
- Prisma - Database ORM
- GraphQL Yoga - GraphQL server implementation
- Pothos - Code-first GraphQL schema builder
- SQLite - Database
- bcryptjs - Password hashing
- jsonwebtoken - JWT implementation
- nodemailer - Email sending
- winston - Logging

For detailed information about the backend, see [backend/README.md](backend/README.md).

### Frontend (`/frontend`)

The frontend is a React application that provides the user interface for data visualization and management.

**Purpose:**

- User authentication interface (login/signup/user management) integrated with the backend GraphQL API
- Dashboard for viewing well data
- Wellbore diagram generation and visualization
- Data management interfaces for wells and related entities
  - Import pdf and excel files
  - View and edit well data
  - Generate adhoc WBD's (Wellbore Diagrams) in svg/pdf format
  - Possibly generate regulatory forms in the future
- In the future, implement automated bidding features

**Major Libraries Used:**

- React - UI library
- TypeScript - Type safety for JavaScript
- urql - GraphQL client for API communication (lightweight alternative to Apollo Client)
  - Integrates seamlessly with shadcn/ui components
  - All libraries are fully open source with permissive licenses (MIT/Apache 2.0) suitable for commercial use in oil & gas companies
  - Note: GraphQL Yoga and Pothos are server-side libraries (not clients) used for building the backend GraphQL API
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - UI component library
- React Router - Routing library
- Zustand - State management

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
