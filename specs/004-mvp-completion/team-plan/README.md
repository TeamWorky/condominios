# MVP Completion — Team Plan

## Team

| Miembro | GitHub | Foco | Herramienta IA |
|---------|--------|------|----------------|
| **Martin Miranda** | @martinmiranda14 | Backend, Infrastructure, Security, DevOps | Claude Code |
| **Carlos Compuelec** | @Compuelec | Frontend, UX, Accessibility | Claude Code |

## Documentos de este directorio

| Archivo | Proposito |
|---------|-----------|
| [status.md](status.md) | Estado actual del proyecto — que esta hecho y que falta |
| [martin-plan.md](martin-plan.md) | Features asignadas a Martin con orden y speckit commands |
| [carlos-plan.md](carlos-plan.md) | Features asignadas a Carlos con orden y speckit commands |
| [dependencies.md](dependencies.md) | Grafo de dependencias entre features y bloqueos |
| [sprints.md](sprints.md) | Distribucion por sprints con fechas tentativas |

## Flujo de trabajo

Cada feature sigue el flujo obligatorio de Speckit:

```
/speckit.specify <feature-description>   # Crear spec
/speckit.clarify <feature-id>            # Resolver ambiguedades
/speckit.plan <feature-id>               # Plan tecnico
/speckit.tasks <feature-id>              # Tareas ordenadas
/speckit.checklist <feature-id>          # Checklist QA
/speckit.implement <feature-id>          # Implementar
# QA Manual con quickstart.md
/speckit.analyze <feature-id>            # Verificar consistencia
```

## Reglas de coordinacion

1. **Cada feature = 1 branch** desde `development`
2. **PRs a `development`** — nunca push directo
3. **Cuando hay dependencia** (ej: frontend necesita backend), el que depende espera el merge del PR bloqueante
4. **Comunicacion**: Marcar en el PR si hay features dependientes bloqueadas
5. **Review cruzado**: Martin revisa PRs de Carlos y viceversa
