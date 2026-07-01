# Contributing to IPES

Thank you for contributing to the Individual Performance Evaluation System (IPES)! This guide details the development workflows, branching policies, and coding standards for this project.

---

## 🌿 Branching Policy

To ensure release stability, we enforce a strict branching protocol:

1. **`main` Branch**:
   - Production branch.
   - Direct commits to `main` are strictly prohibited.
   - `main` can ONLY be updated by merging the `dev` branch via pull request.
2. **`dev` Branch**:
   - Active development branch. All feature branches should branch off of `dev`.
3. **Feature Branches**:
   - Created for specific tasks (e.g. `feat/new-evaluations` or `fix/user-login`).
   - Merged back into `dev` via pull requests after reviews and CI checks pass.

---

## 💬 Conventional Commits

We follow the Conventional Commits specification to maintain a clean git history:

### Message Format:
```text
<type>(<optional scope>): <description>

[optional body]
```

### Allowable Types:
- **`feat`**: A new feature for the user.
- **`fix`**: A bug fix for the user.
- **`docs`**: Changes to documentation or guidelines.
- **`style`**: Code formatting, missing semi-colons, etc. (no behavior changes).
- **`refactor`**: Code changes that neither fix a bug nor add a feature.
- **`perf`**: Performance optimizations.
- **`test`**: Adding missing tests or correcting existing tests.
- **`build`**: Changes affecting the build system or external dependencies.
- **`ci`**: CI workflow configuration adjustments.
- **`chore`**: Maintenance tasks.

### Guidelines:
- Write descriptions in the **imperative, present tense** (e.g., "fix bug", not "fixed bug").
- Keep descriptions in lowercase, and do not end them with a period.

---

## 🛠️ Staging and Committing Guidelines

- **Separate Concerns**: Do not stage unrelated edits in a single massive commit. Stage and commit in small, logical chunks (e.g. separate the settings adjustments from test fixes).
- **Run Local Verification**: Before committing or pushing, verify that backend and frontend test suites pass:
  - Run `python manage.py test` inside `backend/`.
  - Run `npm run test` inside `frontend/`.
