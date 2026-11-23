# Brewery Platform - Copilot Context & Onboarding Guide

This document provides essential context about the Brewery Platform repository for Copilot and new team members.

## 🏗️ Repository Architecture

This is a **TypeScript monorepo** using pnpm workspaces and Turborepo for managing multiple applications and packages.

### Workspace Structure

```
brewery-platform/
├── apps/                    # Production applications
│   ├── backend/            # NestJS API server (main backend)
│   └── mqtt-server/        # MQTT message broker service
├── packages/               # Shared libraries used across apps
│   ├── models/             # Shared data models & types
│   ├── mqtt/               # MQTT utilities & helpers
│   ├── plugins/            # Plugin system & framework
│   ├── socket-events/      # WebSocket event definitions
│   └── tsconfig/           # Shared TypeScript configurations
├── plugins/                # Custom plugin implementations
│   └── local-device/       # Device plugin for local hardware
├── archive/                # Legacy packages (not actively maintained)
└── brewery-platform-api-requests/  # API request examples & collection
```

## 📋 Technology Stack

### Core Technologies
- **Runtime**: Node.js >=24
- **Package Manager**: pnpm >=11 (workspace-based)
- **Build Tool**: Turborepo (monorepo orchestration)
- **Language**: TypeScript >=6.0

### Backend Stack (apps/backend)
- **Framework**: NestJS 11
- **API**: REST with Swagger/OpenAPI documentation
- **WebSocket**: Socket.IO for real-time events
- **Message Queue**: BullMQ with Redis
- **Database**: 
  - MySQL 9.7 (production/primary)
  - SQLite (testing)
- **ORM**: Sequelize with TypeScript decorators
- **Authentication**: JWT (jsonwebtoken)
- **Logging**: Pino with pretty-printing
- **Validation**: Zod with nestjs-zod integration

### MQTT Integration
- **Library**: mqtt v5.15.1
- **Custom Package**: @overtheairbrew/mqtt (packages/mqtt)
- **Purpose**: Device communication & IoT data streaming

### Testing Stack
- **Framework**: Vitest (unit & e2e)
- **Coverage**: Istanbul
- **Doubles**: @suites/doubles.vitest
- **DI Testing**: @suites/di.nestjs
- **Integration Tests**: Testcontainers (Docker-based)

### Code Quality
- **Linting**: ESLint (TypeScript support)
- **Formatting**: Prettier
- **Pre-commit Hooks**: Husky + lint-staged
- **Version Control**: Changesets for versioning

## 🚀 Getting Started

### Prerequisites
```bash
# Ensure correct Node version
node --version  # Should be >=24.x

# Ensure pnpm is installed
pnpm --version  # Should be >=11.0
```

### Installation

```bash
# Install dependencies for entire workspace
pnpm install

# Start development environment with Docker containers
docker-compose up -d  # Starts MySQL and Redis

# Run the backend in development mode
pnpm run dev
# or specifically:
cd apps/backend
pnpm run start:dev
```

**Note**: The `start:dev` script automatically runs database migrations via the `MIGRATE=true` environment variable.

### Available Commands (Root Level)

All commands run across the entire workspace via Turborepo:

```bash
# Development
pnpm run dev              # Start all apps in watch mode
pnpm run start:dev        # Alias for dev

# Building
pnpm run build            # Build all packages and apps
pnpm run prune            # Optimize workspace dependencies

# Testing
pnpm run test             # Run all unit & e2e tests
pnpm run test:unit        # Only unit tests
pnpm run test:e2e         # Only e2e tests with coverage
pnpm run test:all         # All tests with full coverage

# Code Quality
pnpm run lint             # Run ESLint on all packages

# Release
pnpm run release          # Build and publish via Changesets
pnpm run version          # Update versions using Changesets
```

### Backend-Specific Commands

```bash
cd apps/backend

# Development
pnpm run start:dev        # Watch mode with auto-reload
pnpm run start:debug      # Debugger mode

# Production
pnpm run build            # Create optimized build
pnpm run start:prod       # Run production build

# Testing
pnpm run test             # All tests (unit + e2e)
pnpm run test:unit        # Unit tests with coverage
pnpm run test:e2e         # E2E tests with coverage

# Code Quality
pnpm run lint             # Fix linting issues
pnpm run format           # Format code with Prettier
```

## 🗄️ Infrastructure & Services

### Docker Compose Stack (Local Development)
```yaml
services:
  database: MySQL 9.7.0 (port 3306)
    - Database: breweryplatform
    - Credentials: empty password (development only)
  
  redis: Redis 7.2.0 (port 6379)
    - Used for caching and BullMQ queues
```

**Start services**:
```bash
docker-compose up -d
```

**Access services**:
- MySQL: `localhost:3306`
- Redis: `localhost:6379`

## 📦 Key Packages Overview

### @overtheairbrew/models
- **Purpose**: Shared data models and TypeScript types
- **Used by**: Backend and all services
- **Key Exports**: Domain models, DTOs, interfaces

### @overtheairbrew/mqtt
- **Purpose**: MQTT client utilities and event handling
- **Used by**: Backend, mqtt-server
- **Key Features**: Connection management, message routing

### @overtheairbrew/plugins
- **Purpose**: Plugin system framework and abstractions
- **Used by**: Backend for extensibility
- **Key Features**: Plugin registration, lifecycle hooks

### @overtheairbrew/socket-events
- **Purpose**: Type-safe WebSocket event definitions
- **Used by**: Backend for real-time communication
- **Key Features**: Event schemas, type safety

### @overtheairbrew/tsconfig
- **Purpose**: Shared TypeScript configurations
- **Used by**: All packages for consistency
- **Configurations**: 
  - `base.json` - Base configuration
  - `nestjs.json` - NestJS-specific
  - `nextjs.json` - Next.js-specific
  - `react-library.json` - React library

## 🔧 Build & Task Configuration

### Turborepo Setup
Configuration: [turbo.json](/turbo.json)

**Task Dependencies**:
- `build` task depends on `^build` (dependencies first)
- Output cache: `dist/` directory
- `start:dev` is persistent (not cached)
- `test:unit` and `test:e2e` don't use cache

**Running Tasks**:
```bash
pnpm run build              # All packages
pnpm run build --filter=backend  # Specific package
turbo run build --dry-run   # See execution plan
```

## 📝 Coding Conventions

### TypeScript
- Use strict mode (enabled in tsconfig)
- Use workspace aliases (e.g., `@overtheairbrew/models`)
- Follow NestJS module/controller/service patterns in backend

### NestJS Structure (Backend)
```
src/
├── app.module.ts          # Root module
├── main.ts                # Entry point
├── [feature]/
│   ├── [feature].module.ts    # Feature module
│   ├── [feature].controller.ts # HTTP endpoints
│   ├── [feature].service.ts    # Business logic
│   └── dto/                   # Request/response DTOs
├── auth/                  # Authentication module
├── config/                # Configuration management
├── data/                  # Database models & migrations
└── plugins/               # Plugin integration
```

### File Naming
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Modules: `*.module.ts`
- DTOs: Use `*.dto.ts` suffix
- Tests: `*.spec.ts` for unit, `.e2e.ts` for integration

### Validation & DTOs
- Use Zod schemas for validation
- Create DTOs from Zod schemas using `nestjs-zod`
- Leverage Swagger decorators for API documentation

## 🧪 Testing

### Test Organization
- **Unit Tests**: `src/**/*.spec.ts`
- **E2E Tests**: `test/**/*.e2e.ts`
- **Coverage Reports**: `coverage/` directory

### Running Tests
```bash
# Root level
pnpm run test              # Both unit and e2e
pnpm run test:unit         # Only unit with coverage
pnpm run test:e2e          # Only e2e with coverage

# Backend specific
cd apps/backend
pnpm run test              # Both suites
pnpm run test:unit         # Unit only
pnpm run test:e2e          # E2E only
```

### Test Infrastructure
- Tests use Testcontainers for database/cache testing
- MySQL and Redis containers are provisioned automatically
- No manual test database setup required

## 🚢 Release Process

### Using Changesets
1. Create a changeset during development:
   ```bash
   pnpm changeset
   ```
   - Choose affected packages
   - Select version bump (patch/minor/major)
   - Add description

2. Commit the changeset file

3. Release when ready:
   ```bash
   pnpm run release
   ```
   This:
   - Updates all version numbers
   - Updates CHANGELOGs
   - Publishes packages

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Workspace configuration, build allowlist |
| `turbo.json` | Turborepo task definitions & caching |
| `tsconfig.json` | Root TypeScript configuration |
| `docker-compose.yml` | Local development services |
| `.github/workflows/` | CI/CD pipelines |
| `apps/backend/vite.config.mjs` | Backend test configuration |
| `renovate.json` | Dependency update automation |

## 🔑 Important Notes for Contributors

### Workspace Dependencies
- Use workspace protocol: `workspace:*` (see package.json files)
- Changes to packages auto-sync when using `pnpm run dev`

### Git Workflow
- Husky hooks run pre-commit linting
- Staged changes only (lint-staged)
- Keep commits focused on single features

### Database Migrations
- Located in: `apps/backend/src/data/migrations/`
- ORM: Sequelize with Umzug migration runner
- Migrations run automatically in `start:dev`

### API Documentation
- Swagger UI available at: `http://localhost:3000/api/docs`
- Generated from NestJS Swagger decorators
- Keep decorators updated when modifying endpoints

## 🆘 Troubleshooting

### Common Issues

**Port already in use (3306, 6379)**
```bash
# Kill existing containers
docker-compose down -v
docker-compose up -d
```

**pnpm install fails**
```bash
# Clear cache
pnpm store prune
pnpm install
```

**Node version mismatch**
```bash
# Check required version
cat .nvmrc
# Use nvm to switch
nvm use
```

**Type errors after package changes**
```bash
# Rebuild with fresh cache
pnpm run build --force
```

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Zod Validation](https://zod.dev)
- [Sequelize ORM](https://sequelize.org)
- [MQTT.js Client](https://github.com/mqttjs/MQTT.js)

---

**Last Updated**: 2026-11-23
**Maintained by**: Over the Air Brew Team

For questions or updates to this guide, please contact the team or file an issue.
