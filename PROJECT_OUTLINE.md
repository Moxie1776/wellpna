# WellPNA (Well Planning and Analysis) Project Outline

## Project Purpose

WellPNA (Well Planning and Analysis) is a comprehensive solution for oil and gas companies to manage well data, analyze well information, generate reports, and create visualizations. It streamlines the process of importing well data from various sources (PDFs, Excel files), storing it in a structured format, and providing tools for analysis and reporting.

## System Architecture

The project consists of two main components:

1. **Backend API** - Handles data processing, storage, and business logic
2. **Frontend UI** - Provides the user interface for data visualization and management

## Backend Functionality

The backend is responsible for:

1. Mining data from PDF and Excel files related to oil/gas wells
2. Storing this data in a SQLite database using Prisma ORM
3. Providing APIs for accessing well data
4. Generating reports in PDF and Excel formats
5. Handling user authentication

### Data Model

The system manages complex well data including:

- Well information (API numbers, locations, depths, etc.)
- Casing records
- Perforation intervals
- Plug schedules
- Mechanical isolation data
- Geological information
- Operator details

### Data Processing

- PDF parsing using pdf2json library
- Excel processing using ExcelJS
- Data extraction and transformation into structured format
- Database storage using Prisma ORM

## Frontend Functionality

The frontend is a React application that uses React Admin for the dashboard. It provides:

1. User authentication pages (login/signup)
2. A dashboard for viewing well data
3. Wellbore diagram generation and visualization
4. Data management interfaces for wells and related entities

### UI Components

- Login and signup pages
- Dashboard for overview of well data
- Wellbore diagram visualization
- Data management interfaces for all well-related entities

## Technology Stack

### Backend

- Node.js with TypeScript
- Prisma ORM with SQLite database
- GraphQL API with Apollo Server
- PDF processing with pdf2json
- Excel processing with ExcelJS
- PDF generation with jsPDF
- Authentication with JWT and bcrypt

### Frontend

- React with TypeScript
- React Admin for dashboard
- Tailwind CSS for styling
- shadcn/ui components
- React Router for navigation
- Zustand for state management

## Color Scheme

The application uses a consistent color scheme:

- Primary color: #012d6c (dark blue)
- Secondary color: #c51230 (red)

## Future Development

- Bid generation functionality
- Enhanced reporting capabilities
- Advanced data analysis features
- Integration with additional data sources
