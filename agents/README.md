# AI Agents - Condominios SaaS Platform

Custom multi-agent system for building and operating the Condominios condominium management platform.

## Agent Count: 3 custom agents

| Agent | File | Purpose |
|-------|------|---------|
| Condominios Orchestrator | `custom/condominios-orchestrator.md` | Full pipeline orchestration: spec → dev → QA → ship |
| Condominios Project Manager | `custom/condominios-project-manager.md` | Spec-to-task conversion, sprint management, Speckit SDD enforcement |
| Multi-Agent Coordinator | `custom/condominios-multi-agent-coordinator.md` | Task routing, team composition, parallel workstream management |

## Agent Teams (Defined in Orchestrator)

### Engineering Sprint Team
```
Backend Architect + Frontend Developer + API Tester + Code Reviewer + Security Engineer
```

### Quality Gate Team
```
Reality Checker + Evidence Collector + Performance Benchmarker + Accessibility Auditor
```

### Go-to-Market Team
```
Product Manager + Content Creator + Growth Hacker + Sales Engineer + SEO Specialist
```

## Directory Structure

```
agents/
├── README.md              # This file
└── custom/                # 3 agents - project-specific
    ├── condominios-orchestrator.md
    ├── condominios-project-manager.md
    └── condominios-multi-agent-coordinator.md
```
