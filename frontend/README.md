# WellPNA Frontend

## Overview

The WellPNA frontend is a React application that provides the user interface for data visualization and management in the Well Planning and Analysis system.

## Technology Stack

- React with TypeScript
- React Admin - Admin dashboard framework
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - UI component library
- React Router - Routing library
- Zustand - State management

## Component Architecture

### Frontend Components

- **Pages** (`src/pages/`): Top-level page components
- **Components** (`src/components/`): Reusable UI components
- **Services** (`src/services/`): Client-side service functions
- **Providers** (`src/providers/`): Data and authentication providers for React Admin

## Key Features

- User authentication interface (login/signup/user management)
- Dashboard for viewing well data
- Wellbore diagram generation and visualization
- Data management interfaces for wells and related entities
  - Import PDF and Excel files
  - View and edit well data
  - Generate ad-hoc WBD's (Wellbore Diagrams) in SVG/PDF format
  - Possibly generate regulatory forms in the future
 ## Project Structure
 
 The frontend project follows a standard React/Vite structure, with key directories organized as follows:
 
 -   **`public/`**: Static assets that are served directly by the web server (e.g., `vite.svg`).
 -   **`src/`**: Contains the main application source code.
     -   **`assets/`**: Images and other static assets used within components.
     -   **`components/`**: Reusable UI components. This includes:
         -   **`ui/`**: Presentational components, often from a UI library like shadcn/ui.
         -   **`public/`**: Components related to public-facing pages (e.g., authentication forms).
     -   **`hooks/`**: Custom React hooks.
     -   **`lib/`**: Utility functions and client configurations (e.g., GraphQL client).
     -   **`pages/`**: Top-level route components.
     -   **`providers/`**: React context providers (e.g., theme, toast).
     -   **`services/`**: API client functions or business logic services.
     -   **`store/`**: State management logic (e.g., Zustand stores).
     -   **`utils/`**: General utility functions.
 -   **`vite.config.ts`**: Vite build configuration.
 -   **`tsconfig.*.json`**: TypeScript configuration files for different build targets.
 -   **`.env*` files**: Environment variable configuration.
 
 ## Setup
- In the future, implement automated bidding features

## Project Structure

The frontend project follows a standard React/Vite structure, with key directories organized as follows:

-   **`public/`**: Static assets that are served directly by the web server (e.g., `vite.svg`).
-   **`src/`**: Contains the main application source code.
    -   **`assets/`**: Images and other static assets used within components.
    -   **`components/`**: Reusable UI components. This includes:
        -   **`ui/`**: installed shadcn components via `npx shadcn-ui add`
        -   **`public/`**: Components related to public-facing pages (e.g., authentication forms).
    -   **`hooks/`**: Custom React hooks.
    -   **`lib/`**: Utility functions and client configurations (e.g., GraphQL client).
    -   **`pages/`**: Top-level route components.
    -   **`providers/`**: React context providers (e.g., theme, toast).
    -   **`services/`**: API client functions or business logic services.
    -   **`store/`**: State management logic (e.g., Zustand stores).
    -   **`utils/`**: General utility functions.
-   **`vite.config.ts`**: Vite build configuration.
-   **`tsconfig.*.json`**: TypeScript configuration files for different build targets.
-   **`.env*` files**: Environment variable configuration.

## Setup

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

## Development

The frontend uses TypeScript for type safety and follows React best practices. Components are styled using Tailwind CSS with the project's defined color scheme.

## Color Scheme

The application uses a consistent color scheme:

- **Primary Color:** #012d6c (Dark Blue)
- **Secondary Color:** #c51230 (Red)

These colors are defined in `tailwind.config.js` and can be used as `text-primary`, `bg-primary`, etc.
