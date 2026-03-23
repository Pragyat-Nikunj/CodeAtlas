# CodeAtlas

> **AI-powered repository analysis and architectural documentation at scale**

CodeAtlas is a full-stack application that transforms GitHub repositories into interactive, AI-generated architectural documentation. By combining advanced code analysis, security auditing, and interactive visualization, CodeAtlas helps teams understand complex codebases quickly and collaborate more effectively.

## 🎯 Features

### Core Capabilities

- **Intelligent Repository Analysis** — Upload any GitHub repository and get instant architectural analysis powered by Google Gemini AI
- **Real-time Progress Tracking** — Monitor ingestion jobs with live status updates and detailed progress indicators
- **Rate-Limited API** — Built-in protection against abuse with configurable rate limiting per user/IP
- **Vector Embeddings** — Semantic search capabilities for instant documentation retrieval using Gemini embeddings

### Technical Highlights

- **Monorepo Architecture** — Unified workspace with shared type definitions across frontend and backend
- **Type-Safe Throughout** — Full TypeScript implementation with Zod validation for runtime safety
- **AI-Driven Insights** — Multi-stage analysis pipeline including structural reconnaissance and security hardening
- **Production-Ready** — Comprehensive error handling, logging, authentication, and data persistence

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm/pnpm
- **Supabase Account** — Database and authentication
- **Google Gemini API Key** — For AI-powered analysis
- **GitHub Account** — For repository access (optional, for private repos)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pragyat-Nikunj/CodeAtlas
   cd CodeAtlas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in the workspace root:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Google Gemini API
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   
   # Application
   NODE_ENV=development
   LOG_LEVEL=info
   ```

4. **Set up database**
   ```bash
   # Run migrations (from backend directory)
   cd backend
   npm run migrate
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   
   # This starts both frontend and backend concurrently
   ```

   - **Frontend:** http://localhost:3000
   - **Backend:** http://localhost:5000

## 📚 Project Structure

```
CodeAtlas/
├── frontend/              # Next.js web application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and supabase client
│   │   └── providers/    # Context providers (auth, etc)
│   └── package.json
│
├── backend/              # Express API server
│   ├── src/
│   │   ├── app.ts        # Express setup
│   │   ├── server.ts     # Server entry point
│   │   ├── config/       # Configuration (logger, supabase)
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── validations/  # Zod schemas
│   │   ├── utils/        # Helper functions
│   │   └── test/         # Unit and integration tests
│   └── package.json
│
├── packages/
│   └── shared-schema/    # Shared TypeScript types and Zod schemas
│
└── package.json          # Root workspace configuration
```

## 🔌 API Endpoints

### Projects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/projects` | List all analyzed projects | ❌ |
| `GET` | `/api/projects/:id` | Get project metadata | ❌ |
| `GET` | `/api/projects/:id/nodes` | Get documentation tree | ❌ |
| `GET` | `/api/projects/:id/security` | Get security findings | ❌ |
| `POST` | `/api/projects` | Ingest new repository | ✅ |

### Jobs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/jobs/:id` | Poll job status and progress | ❌ |

**Authentication:** Bearer token in `Authorization` header required for protected endpoints.

### Example: Ingest a Repository

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": {
      "url": "https://github.com/facebook/react",
      "owner": "facebook",
      "repo": "react"
    }
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "projectId": "proj_123...",
    "jobId": "job_456...",
    "repository": "facebook/react"
  }
}
```

## 🏗️ Architecture Overview

### Ingestion Pipeline

The application processes repositories through a multi-stage pipeline:

```
1. Repository Cloning     → GitService clones via SSH/HTTPS
2. Context Assembly       → FileService scans and indexes code
3. Structural Analysis    → Gemini identifies architectural pillars
4. Security Audit         → Gemini scans for vulnerabilities
5. Persistence            → PersistenceService saves with embeddings
6. Cleanup                → GitService removes temporary files
```

### Key Services

| Service | Purpose |
|---------|---------|
| **ProjectService** | Project lifecycle and metadata management |
| **JobService** | Job state machine and progress tracking |
| **GitService** | Repository cloning and file management |
| **FileService** | High-performance code scanning and context assembly |
| **AnalysisService** | Structural and architectural analysis via Gemini |
| **SecurityService** | Vulnerability detection and OWASP mapping |
| **GeminiService** | Gemini API integration with retry logic |
| **PersistenceService** | Data persistence and embedding generation |

### Database Schema (Simplified)

- **projects** — Repository metadata and embeddings
- **ingestion_jobs** — Processing status and progress tracking
- **documentation_nodes** — Architectural pillars and summaries
- **security_findings** — Vulnerability records with locations

## 🔐 Security Features

- **Authentication** — Supabase JWT validation on protected routes
- **Rate Limiting** — 5 requests per 15 minutes for ingestion, 100 per minute globally
- **Input Validation** — Zod schemas on all request bodies
- **Error Handling** — Comprehensive error middleware with safe error messages
- **Security Audits** — Automated OWASP Top 10 scanning
- **Environment Isolation** — Strict environment variable validation

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:coverage
```

Test coverage includes:
- Unit tests for all services
- Integration tests for API endpoints
- Middleware tests (auth, rate limiting, validation)
- Mock implementations for external dependencies

## 📊 Development Workflow

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run build
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Start services
cd frontend && npm run start    # Frontend on port 3000
cd backend && npm run start      # Backend on port 5000
```

## 🛠️ Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start both servers in development mode |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run lint` | Check code style |
| `npm run format` | Auto-format code |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## 📖 API Documentation

### Rate Limiting Headers

All responses include rate limit information:

```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1640000000
```

### Error Responses

```json
{
  "success": false,
  "error": "Descriptive error message",
  "stack": null  // Only in development
}
```

### Common Status Codes

- `200` — Success
- `201` — Resource created
- `400` — Validation error
- `401` — Authentication required or invalid
- `404` — Resource not found
- `429` — Rate limit exceeded
- `500` — Server error

## 🚦 Job Status States

Jobs progress through these states:

```
PENDING → CLONING → ANALYZING → SECURITY_AUDIT → COMPLETED
                              ↓
                            FAILED (with error_message)
```

Track progress with `/api/jobs/:id`:

```json
{
  "success": true,
  "data": {
    "status": "ANALYZING",
    "progress": 45,
    "projectId": "proj_123...",
    "error": null
  }
}
```

## 🎓 Tech Stack

### Backend
- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API + LangChain
- **Validation:** Zod
- **Logging:** Winston
- **Testing:** Vitest

### Frontend
- **Framework:** Next.js 16
- **UI:** React 19 + Tailwind CSS + shadcn/ui
- **Visualization:** Three.js
- **Authentication:** Supabase Auth

### DevOps
- **Package Manager:** npm (monorepo)
- **Linting:** ESLint
- **Formatting:** Prettier
- **Version Control:** Git

## 📝 Environment Variables Reference

### Backend (`backend/.env.local`)

```env
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# AI Services
GOOGLE_GENAI_API_KEY=AIzaSy...

# Server
NODE_ENV=development|production|test
PORT=5000
LOG_LEVEL=info|debug|error|warn

# Rate Limiting
INGESTION_RATE_LIMIT_WINDOW_MS=900000
INGESTION_RATE_LIMIT_MAX=5
```

### Frontend (`frontend/.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

Please ensure:
- Tests pass (`npm run test`)
- Code is formatted (`npm run format`)
- Linting passes (`npm run lint`)
- Types check (`npm run build`)


## 🎉 Acknowledgments

Built with enthusiasm using:
- Google Gemini for AI analysis
- Supabase for seamless backend infrastructure
- Next.js for exceptional developer experience
- The open-source community

---

**Made with ❤️ by the CodeAtlas team**
