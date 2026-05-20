# AI Agents - Condominios SaaS Platform

Custom multi-agent system for building and operating the Condominios condominium management platform. All agents are project-specific with full context of the tech stack (NestJS 11, Angular 21, TypeORM, PostgreSQL, Nx monorepo).

## Agent Count: 14 custom agents

### Orchestration & Management (3)

| Agent | File | Purpose |
|-------|------|---------|
| Orchestrator | `condominios-orchestrator.md` | Full pipeline orchestration: spec → dev → QA → ship |
| Project Manager | `condominios-project-manager.md` | Spec-to-task conversion, sprint management, Speckit SDD |
| Multi-Agent Coordinator | `condominios-multi-agent-coordinator.md` | Task routing, team composition, parallel workstreams |

### Engineering (6)

| Agent | File | Purpose |
|-------|------|---------|
| Backend Architect | `condominios-backend-architect.md` | NestJS modules, TypeORM entities, multi-tenant APIs |
| Frontend Developer | `condominios-frontend-developer.md` | Angular 21 standalone components, Material, Signals |
| Software Architect | `condominios-software-architect.md` | Module boundaries, Nx dependency rules, architecture decisions |
| Database Optimizer | `condominios-database-optimizer.md` | TypeORM queries, PostgreSQL optimization, migrations |
| DevOps Automator | `condominios-devops-automator.md` | Docker, CI/CD, environment config, deployment |
| Git Workflow Master | `condominios-git-workflow-master.md` | Gitflow enforcement, branch management, releases |

### Quality & Security (3)

| Agent | File | Purpose |
|-------|------|---------|
| Code Reviewer | `condominios-code-reviewer.md` | PR reviews: security, coverage, architecture compliance |
| API Tester | `condominios-api-tester.md` | Jest 30 specs, mocking patterns, 70%+ coverage |
| Security Engineer | `condominios-security-engineer.md` | OWASP Top 10 audits, JWT/RBAC, multi-tenant isolation |

### Product & Support (2)

| Agent | File | Purpose |
|-------|------|---------|
| Product Manager | `condominios-product-manager.md` | Feature specs, backlog prioritization, roadmap |
| Support Responder | `condominios-support-responder.md` | User issue resolution, troubleshooting, escalation |

### Design (1)

| Agent | File | Purpose |
|-------|------|---------|
| UX Architect | `condominios-ux-architect.md` | User flows, accessibility, Angular Material patterns |

### Documentation (1)

| Agent | File | Purpose |
|-------|------|---------|
| Technical Writer | `condominios-technical-writer.md` | Swagger docs, README, CLAUDE.md, Speckit artifacts |

## Agent Teams

### Engineering Sprint Team
```
Backend Architect + Frontend Developer + API Tester + Code Reviewer + Security Engineer
```

### Quality Gate Team (Pre-PR)
```
Code Reviewer + Security Engineer + API Tester + UX Architect (accessibility)
```

### Architecture Review Team
```
Software Architect + Database Optimizer + Backend Architect
```

### Go-to-Market Team
```
Product Manager + UX Architect + Technical Writer + Support Responder
```

## Directory Structure

```
agents/
├── README.md
└── custom/
    ├── condominios-orchestrator.md
    ├── condominios-project-manager.md
    ├── condominios-multi-agent-coordinator.md
    ├── condominios-backend-architect.md
    ├── condominios-frontend-developer.md
    ├── condominios-software-architect.md
    ├── condominios-database-optimizer.md
    ├── condominios-devops-automator.md
    ├── condominios-git-workflow-master.md
    ├── condominios-code-reviewer.md
    ├── condominios-api-tester.md
    ├── condominios-security-engineer.md
    ├── condominios-product-manager.md
    ├── condominios-support-responder.md
    ├── condominios-ux-architect.md
    └── condominios-technical-writer.md
```
