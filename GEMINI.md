# Project Overview

This is a local-first thumbnail generator with a web UI, an API, and a CLI. The project is a TypeScript monorepo using npm workspaces.

The main technologies used are:
- **Backend:** TypeScript, Express, Sharp
- **Frontend:** React, Vite
- **CLI:** yargs

## Building and Running

- **Install dependencies:** `npm install`
- **Run the API:** `npm run dev:api` (http://localhost:8787)
- **Run the Web UI:** `npm run dev:web` (http://localhost:5173)
- **Build all packages:** `npm run build`
- **Run tests for all packages:** `npm run test`

## Development Conventions

- **Linting:** The project uses ESLint and Prettier for code linting and formatting. Run `npm run lint` to check for issues and `npm run lint:fix` to automatically fix them.
- **Monorepo Structure:** The project is organized as a monorepo with `apps` and `packages` directories.
  - `apps`: Contains the API and web applications.
  - `packages`: Contains the core imaging logic and the CLI.
- **Testing:** Each package has its own test suite. Run `npm test -ws` to run all tests.
