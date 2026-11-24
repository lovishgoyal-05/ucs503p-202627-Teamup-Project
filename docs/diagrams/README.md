# TeamUp Data Flow and Entity-Relationship Diagrams

This folder contains editable diagram source files. These diagrams describe the intended system design and must be kept synchronized with the database migrations and implementation.

## Included diagrams

- `dfd-level-0.mmd` — context-level data-flow diagram (external actors and systems interacting with TeamUp).
- `dfd-level-1.mmd` — decomposed data-flow diagram (main application processes and data stores).
- `erd.mmd` — conceptual entity-relationship diagram (entities and principal relationships).
- `architecture.mmd` — high-level system architecture.
- `use-case.puml` — UML use-case overview in PlantUML format.

## MSR (Model–Service–Repository) mapping

- **Model:** database entities represented by the ERD and implemented as JPA/domain model classes.
- **Repository:** persistence operations that read/write the ERD entities.
- **Service:** business processes represented in DFD Level 1, including authentication/session handling, event moderation, skill matching, recruitment, join-request review, and team lifecycle rules.
- **Controller/API:** entry points shown in the architecture and use-case diagrams; controllers should delegate business decisions to services.
- **External entities:** Student, Organizer, Admin, Google OIDC, and configured external event feeds, as represented in the DFD.

## Rendering

- Mermaid (`.mmd`): paste the file contents into https://mermaid.live or use a Mermaid-compatible Markdown preview.
- PlantUML (`.puml`): use a PlantUML extension or renderer.

## Accuracy note

These are conceptual design diagrams, not proof that every relationship is already implemented. Verify each entity, foreign key, cardinality, constraint, and process against the current Flyway migration and code before treating the diagrams as final. Update diagram sources whenever schema or behavior changes.
