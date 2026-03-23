# CodeAtlas Backend

Express.js API server for repository analysis and AI-powered architectural documentation generation.

## Overview

The backend provides a REST API for ingesting GitHub repositories, analyzing their structure, performing security audits, and persisting results with vector embeddings for semantic search.

**Tech Stack:** Node.js, TypeScript, Express, Supabase, Gemini AI, Winston, Zod

## Directory Structure

```
src/
├── app.ts              # Express configuration
├── server.ts           # Entry point
├── config/             # Database & logging setup
├── controllers/        # Request handlers
├── routes/             # API route definitions
├── services/           # Core business logic
├── middleware/         # Auth, validation, rate limiting, error handling
├── validations/        # Zod schemas
├── utils/              # Helper functions
└── test/               # Unit & integration tests
```

## Key Services

| Service                | Purpose                                 |
| ---------------------- | --------------------------------------- |
| **ProjectService**     | Project metadata and lifecycle          |
| **JobService**         | Job state machine and progress tracking |
| **GitService**         | Repository cloning and cleanup          |
| **FileService**        | Code scanning and context assembly      |
| **AnalysisService**    | Architectural analysis via Gemini       |
| **SecurityService**    | Vulnerability scanning                  |
| **GeminiService**      | Gemini API with retry logic             |
| **PersistenceService** | Save and embed data                     |

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

## Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
NODE_ENV=development
PORT=5000
```

## API Endpoints

### Projects

- `GET /api/projects` — List all projects
- `GET /api/projects/:id` — Get project details
- `GET /api/projects/:id/nodes` — Get documentation tree
- `GET /api/projects/:id/security` — Get security findings
- `POST /api/projects` — Ingest repository (auth required)

### Jobs

- `GET /api/jobs/:id` — Poll job status

**Rate Limiting:** 5 ingestion requests per 15 minutes; 100 global requests per minute

## Available Commands

```bash
npm run dev              # Start with tsx watch
npm run build           # Compile TypeScript
npm run start           # Run compiled server
npm run test            # Run tests
npm run test:watch     # Tests in watch mode
npm run lint           # Check code style
npm run format         # Auto-format code
```

## Processing Pipeline

```
POST /api/projects
  ↓
GitService.cloneRepository
  ↓
FileService.getProjectContext
  ↓
AnalysisService.runStructuralScout + SecurityService.runSecurityAudit (parallel)
  ↓
PersistenceService.saveManifest + PersistenceService.saveSecurityReport
  ↓
GitService.cleanup
```

## Middleware Stack

- **authenticateUser** — Validates Supabase JWT
- **validate** — Zod request validation
- **ingestionRateLimiter** — 5 per 15 min (ingestion)
- **globalRateLimiter** — 100 per min (all endpoints)
- **errorHandler** — Global error formatting

## Testing

```bash
npm run test            # Single run
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

Tests include services, controllers, middleware, and integration scenarios with mocked Supabase/Gemini.

## Logging

Winston logger outputs to:

- `logs/error.log` — Errors only
- `logs/combined.log` — All levels
- Console (development only)

## Database

Supabase PostgreSQL with tables:

- `projects` — Repository metadata
- `ingestion_jobs` — Job tracking
- `documentation_nodes` — Pillars & summaries
- `security_findings` — Vulnerabilities

## Performance Notes

- File scanning uses **iterative walk** (prevents stack overflow)
- Concurrent file reading with **20-file batches**
- Git clone uses `--depth 1` for speed
- Gemini requests include exponential backoff (up to 5 retries)
- Rate limiting prevents API abuse

## Error Handling

All errors return consistent JSON:

```json
{
  "success": false,
  "error": "Descriptive message",
  "stack": null // Production only
}
```

Status codes: `200`, `201`, `400`, `401`, `404`, `429`, `500`

## Development Tips

- Use `npm run dev` for hot-reload with tsx
- Check `src/test/` for mock patterns
- Middleware execution order: auth → validate → rate limit → route → error handler
- All database queries use async/await with proper error handling

---

For full documentation, see the [root README](../README.md)
