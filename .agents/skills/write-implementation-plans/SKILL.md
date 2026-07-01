---
name: write-implementation-plans
description: Guidelines and template structures for writing technical implementation plans within the project. Use this skill whenever you need to create or modify an implementation plan document.
---

# Skill: Writing Implementation Plans

Use this skill when you are asked to draft or update technical implementation plans for feature additions, dependency updates, migrations, or architectural refactorings.

## Directory and File Name Conventions

1. **Location**: All implementation plans must be placed in a directory structured by the creation date:
   `docs/generated/implementation_plans/YYYYMMDD/`
   *where `YYYYMMDD` is the current date (e.g., `20260701` for July 1, 2026).*
2. **Filename**: The filename must be in lowercase, using underscores as word separators, and strictly follow the format:
   `{TITLE}_plan_{author_firstname}.md`
   *Example: `audit_dependencies_plan_rafael.md`*

---

## Required Structure & Document Layout

All implementation plan files must contain the following sections, ordered logically:

### 1. Goal / Executive Summary
Provide a brief, high-level description of what the plan achieves, the background context of why these changes are being proposed, and the immediate target problems.

### 2. User Review Required (Or Critical Items)
Highlight any critical or potentially breaking changes, design decisions, or architectural updates that the user needs to approve. Use GitHub-style markdown alerts:
```markdown
> [!IMPORTANT]
> Critical instructions or dependencies.
> [!WARNING]
> Deprecated features or potential side-effects.
```

### 3. Open Questions (If any)
List any questions or points of ambiguity that need user input or engineering clarification before proceeding with the implementation.

### 4. Proposed Changes
Group all proposed changes logically by components (e.g., backend apps, frontend UI primitives, configuration files). For each specific file, demarcate whether it is newly created, modified, or deleted:

*   `#### [NEW] [file_name](file:///path/to/file)`
*   `#### [MODIFY] [file_name](file:///path/to/file)`
*   `#### [DELETE] [file_name](file:///path/to/file)`

> [!IMPORTANT]
> All files referenced must be formatted as clickable absolute file URLs using the standard `file:///` scheme.

### 5. Verification Plan
Clearly define how the implementation will be tested and validated. This section should be split into two:
*   **Automated Tests**: List any test suites, unit tests, coverage commands, or linters that must be run to ensure code correctness (e.g., `python manage.py test` or `npm run test`).
*   **Manual Verification**: Outline the steps to manually verify the features (e.g., running dev servers, testing specific user paths, verifying visual alignment, checking cookies).

---

## Formatting Guidelines
- Use clean Markdown tables to summarize lists (e.g., lists of packages, endpoints, or DB fields).
- Keep bullet points concise and avoid overly verbose prose.
- Do not use generic placeholders; fill in exact versions, file paths, and test commands.
