# WellPNA Implementation Guide

## Overview

This guide provides detailed information on how to extend and maintain the WellPNA application.

## Understanding the Structure

The repository is organized into two main parts:

1. **Backend** - Handles data processing, storage, and API services
2. **Frontend** - Provides the user interface for data visualization and management

## Key Implementation Patterns

### Data Flow

1. **Data Ingestion**: Files are processed by the DataMiner service in `backend/src/services/dataMiner.ts`
2. **Data Storage**: Processed data is stored using Prisma ORM with the schema defined in `backend/prisma/schema.prisma`
3. **Data Access**: Frontend accesses data through GraphQL API endpoints defined in the backend resolvers
4. **Data Presentation**: Frontend displays data using React components and React Admin

### Extending Functionality

#### Adding New Data Types

1. Update the Prisma schema in `backend/prisma/schema.prisma`
2. Run `npx prisma generate` to update the Prisma client
3. Run `npx prisma migrate dev` to update the database
4. Add parsing logic to the DataMiner service if needed
5. Create new GraphQL resolvers for the data type
6. Add UI components in the frontend to display the data

#### Adding New Reports

1. Create a new service in `backend/src/services/` for the report logic
2. Add a GraphQL mutation to trigger the report generation
3. Implement the frontend interface to request and display the report

#### Adding New Visualizations

1. Create a new service function to generate the visualization data
2. Add a GraphQL query to retrieve the data
3. Create a new page/component in the frontend to display the visualization

## Development Workflow

1. **Backend Development**:
   - Add new functionality in `backend/src/services/`
   - Expose through GraphQL resolvers (when implemented)
   - Update database schema if needed in `backend/prisma/schema.prisma`
   - Add tests in `backend/src/__tests__/`

2. **Frontend Development**:
   - Add new pages in `frontend/src/pages/`
   - Create reusable components in `frontend/src/components/`
   - Connect to backend through React Admin data provider
   - Style using Tailwind CSS classes with the defined color scheme

## Testing

- Backend tests are implemented with Jest in `backend/src/__tests__/`
- Frontend testing should follow React testing library patterns
- Integration testing between frontend and backend is done through GraphQL API

## Deployment Considerations

- The backend should be deployed as a Node.js application
- The frontend should be built and served as static files
- The SQLite database is suitable for development but should be replaced with PostgreSQL for production
- Environment variables should be used for configuration
