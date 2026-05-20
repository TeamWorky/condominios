# AI Agents - Condominios SaaS Platform

Multi-agent system for building and operating the Condominios condominium management platform as a complete company.

## Agent Count: 80 agents

| Category | Count | Purpose |
|----------|-------|---------|
| Engineering | 14 | Backend, frontend, mobile, security, DevOps, architecture |
| Design | 4 | UI/UX design, research, brand |
| Testing | 8 | API testing, accessibility, performance, QA evidence |
| Product | 5 | Product management, prioritization, feedback, trends |
| Project Management | 6 | Sprint planning, workflow enforcement, coordination |
| Finance | 5 | Accounting, financial planning, analysis, tax |
| Sales | 8 | Account strategy, deal management, pipeline, proposals |
| Marketing | 8 | Content, SEO, social media, growth, app store |
| Support | 6 | Customer support, analytics, compliance, infrastructure |
| Specialized | 13 | Orchestration, identity, compliance, HR, legal, automation |
| **Custom** | **3** | **Project-specific orchestrator, PM, and coordinator** |

## Custom Agents (Project-Specific)

| Agent | File | Purpose |
|-------|------|---------|
| Condominios Orchestrator | `custom/condominios-orchestrator.md` | Full pipeline orchestration: spec → dev → QA → ship |
| Condominios Project Manager | `custom/condominios-project-manager.md` | Spec-to-task conversion, sprint management, Speckit SDD enforcement |
| Multi-Agent Coordinator | `custom/condominios-multi-agent-coordinator.md` | Task routing, team composition, parallel workstream management |

## Usage with Agent Studio

These agents are compatible with [Agent Studio](https://github.com/msitarzewski/agent-studio) and can be exported to multiple formats:

```bash
# Export all to Claude Code format
npm run cli -- export --format claude --output ~/.claude/agents/

# Export to all supported formats
npm run cli -- export --format all

# Run multi-agent orchestration
npm run cli -- orchestrate \
  --agents condominios-orchestrator backend-architect frontend-developer api-tester \
  --strategy sequential \
  --task "Implement payments module"
```

## Agent Teams

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

### Operations Team
```
Infrastructure Maintainer + SRE + Support Responder + Analytics Reporter
```

## Directory Structure

```
agents/
├── README.md              # This file
├── engineering/           # 14 agents - core development
├── design/                # 4 agents - UI/UX
├── testing/               # 8 agents - QA & validation
├── product/               # 5 agents - product management
├── project-management/    # 6 agents - PM & coordination
├── finance/               # 5 agents - financial operations
├── sales/                 # 8 agents - sales operations
├── marketing/             # 8 agents - marketing & growth
├── support/               # 6 agents - support & operations
├── specialized/           # 13 agents - cross-functional
└── custom/                # 3 agents - project-specific
```
