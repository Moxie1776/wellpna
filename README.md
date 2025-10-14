# WellPnA

WellPnA is a comprehensive well permit and notification application built with modern web technologies.

## Features

- User authentication and authorization
- Profile management
- Admin user management
- Operator management system
- Well permit tracking
- Comprehensive testing suite

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Material-UI (Joy UI), GraphQL
- **Backend**: Node.js, TypeScript, GraphQL Yoga, Prisma, PostgreSQL
- **Testing**: Vitest, React Testing Library
- **Deployment**: Docker, CI/CD with GitHub Actions

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Docker (optional)

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install individually
npm run install:backend
npm run install:frontend
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

### Building

```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build:backend
npm run build:frontend
```

### Testing

```bash
# Run all tests
npm test

# Or run individually
npm run test:backend
npm run test:frontend
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Automatic Versioning

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automatic versioning and changelog generation based on conventional commits.

### How It Works

1. **Conventional Commits**: All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` for new features (minor version bump)
   - `fix:` for bug fixes (patch version bump)
   - `BREAKING CHANGE:` for breaking changes (major version bump)
   - `docs:`, `style:`, `refactor:`, `test:`, `chore:` for other changes

2. **Automatic Releases**: When commits are pushed to the main branch, semantic-release automatically:
   - Analyzes commit messages to determine version bump
   - Updates version numbers in `package.json` files
   - Generates/updates `CHANGELOG.md`
   - Creates GitHub releases
   - Creates Git tags

3. **Monorepo Support**: The root `package.json` and both `backend/package.json` and `frontend/package.json` are versioned together.

### Release Process

- **Patch Release** (1.0.0 → 1.0.1): `fix:` commits
- **Minor Release** (1.0.0 → 1.1.0): `feat:` commits
- **Major Release** (1.0.0 → 2.0.0): `BREAKING CHANGE:` commits

### Automatic Release Process

This project uses **GitHub Actions** for automatic releases. When you push commits to the `main` branch:

1. **Tests run** to ensure code quality
2. **Build process** completes successfully
3. **Semantic-release analyzes** commit messages
4. **Version bumps** automatically based on conventional commits
5. **CHANGELOG.md** gets updated
6. **Git tags** are created (e.g., `v1.1.0`)
7. **GitHub releases** are published

### Manual Release Commands

```bash
# Dry run to see what would be released (local development)
npm run release:dry

# Full release (typically run by CI/CD)
npm run release:ci
```

## Project Structure

```bash
wellpna/
├── backend/              # Node.js/GraphQL backend
│   ├── prisma/           # Database schema and migrations
│   ├── scripts/          # Utility scripts
│   ├── src/              # Backend source code
│   │   ├── generated/    # Auto-generated Prisma and GraphQL types
│   │   ├── graphql/      # GraphQL types, queries, and mutations
│   │   ├── schema/       # GraphQL schema definition
│   │   ├── services/     # Business logic services
│   │   ├── utils/        # Utility functions
│   │   ├── builder.ts    # Pothos schema builder
│   │   ├── client.ts     # Prisma client
│   │   └── server.ts     # GraphQL Yoga server
│   └── tests/            # Backend tests
├── frontend/             # React frontend
│   ├── src/              # Frontend source code
│   │   ├── components/   # Reusable UI components
│   │   │   ├── forms/    # Form components
│   │   │   ├── hookForm/ # React Hook Form integrations
│   │   │   ├── layout/   # Layout components
│   │   │   ├── tables/   # Table components
│   │   │   └── ui/       # Base UI components
│   │   ├── pages/        # Page components
│   │   │   ├── admin/    # Admin pages
│   │   │   ├── dashboard/# Dashboard pages
│   │   │   └── profile/  # Profile pages
│   │   ├── providers/    # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── store/        # Zustand state stores
│   │   ├── utils/        # Utility functions
│   │   ├── lib/          # Configuration and shared code
│   │   └── graphql/      # GraphQL queries and mutations
│   └── tests/            # Frontend tests
├── .github/              # GitHub Actions workflows and templates
│   └── workflows/        # CI/CD workflows (release.yml, codeql.yml)
├── .roo/                 # Roo AI configuration
├── .releaserc.json       # Semantic release configuration
├── PROJECT_OUTLINE.md    # Project documentation
├── package.json          # Root package configuration
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following conventional commit format
4. Test your changes
5. Submit a pull request

## License

[MIT License](LICENSE)
