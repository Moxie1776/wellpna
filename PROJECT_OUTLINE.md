# WellPNA (Well Plug & Abandon) Project Outline

## Project Purpose

WellPNA (Well Plug & Abandon) is a comprehensive solution for oil and gas companies to manage well data, analyze well information, generate reports, and create visualizations. It streamlines the process of importing well data from various sources (PDFs, Excel files), storing it in a structured format, and providing tools for analysis and reporting.

## System Architecture

The project consists of two main components:

1. **Backend API** - Handles data processing, storage, and business logic
2. **Frontend UI** - Provides the user interface for data visualization and management

## Backend Functionality

The backend is responsible for:

1. Mining data from PDF and Excel files related to oil/gas wells
2. Web scraping operator data from regulatory agency websites (TX RRC, NM OCD)
3. Storing this data in a PostgreSQL database using Prisma ORM
4. Providing APIs for accessing well data
5. Generating reports in PDF and Excel formats
6. Handling user authentication

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
- Web scraping using Puppeteer and Cheerio for operator data import and other future projects
- Data extraction and transformation into structured format
- Database storage using Prisma ORM

## Frontend Functionality

The frontend is a React application that provides:

1. User authentication pages (login/signup)
2. A dashboard for viewing well data
3. Wellbore diagram generation and visualization
4. Data management interfaces for wells and related entities
5. Import/export functionality for PDF and Excel files
6. Generation of ad-hoc Wellbore Diagrams (WBDs) in SVG / PDF format

### UI Components

- Login and signup pages
- Dashboard for overview of well data
- Wellbore diagram visualization
- Data management interfaces for all well-related entities

## Technology Stack

### Backend

- Node.js with TypeScript
- Prisma ORM with PostgreSQL database
- GraphQL API with GraphQL Yoga and Pothos
- Authentication with JWT and bcryptjs
- PDF processing with pdf2json
- Excel processing with ExcelJS
- Web scraping with Puppeteer and Cheerio
- PDF generation with jsPDF
- Email sending with nodemailer
- Logging with winston

### Frontend

- React with TypeScript
- Joy UI for component library
- React Router for navigation
- Zustand for state management
- urql for GraphQL client
- React Hook Form and Zod for form handling and validation
- Testing with Vitest and React Testing Library
- Diagram generation with D3.js and SVG
- graphql playground for API exploration
  + library for this has not been determined yet

## Color Scheme

The application uses a consistent color scheme:

- Primary color: #012d6c (dark blue)
- Secondary color: #c51230 (red)

## Current Priorities

1. **Operator Management**
   - Display and maintain operator data using MUI DataGrid
   - Set up web scraping capabilities for importing operator data from regulatory agencies (TX Railroad Commission, NM Oil Conservation Division)
   - Bulk import functionality for operator lists from government websites

2. **Data Management Interfaces**
   - Implement MUI DataGrid components for all major data tables (wells, casing, perforations, plug schedules, etc.)
   - Admin interfaces for data maintenance and import operations

## Future Development

- Bid generation functionality
- Enhanced reporting capabilities
- Advanced data analysis features
- Additional data source integrations beyond operator scraping
