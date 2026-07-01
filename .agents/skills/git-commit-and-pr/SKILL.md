---
name: git-commit-and-pr
description: Skill for structuring Git commits with conventional commit messages, separating concerns, and drafting pull request descriptions. Use when committing code or writing PRs.
---

# Skill: Git Commits & Pull Requests

This skill outlines guidelines for separating concerns in code changes, creating conventional commits, and drafting structured pull request descriptions.

---

## 1. Separation of Concerns in Commits

When staging and committing files, group them by logical concerns instead of bundling unrelated updates into a single massive commit. This improves code readability, simplifies review cycles, and enables clean rollbacks.

### Best Practices:
1. **Identify distinct layers**: Documentation, UI refactoring, dependency configuration, and bug fixes should live in separate commits.
2. **Stage selectively**: Use `git add <file>` or `git add -p` to stage only files/hunks relevant to the current concern.
3. **Run tests between commits**: Verify that each commit is syntactically correct and doesn't break the build before making the next one.

---

## 2. Conventional Commits Guidelines

Follow the Conventional Commits specification for all commit messages.

### Message Structure:
```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types:
- **`feat`**: A new feature for the user (not a build script update).
- **`fix`**: A bug fix for the user.
- **`docs`**: Changes to documentation or skills.
- **`style`**: Formatting, missing semi-colons, etc. (no production code changes).
- **`refactor`**: Refactoring production code (e.g. standardizing APIs without changing behavior).
- **`perf`**: Code changes that improve performance.
- **`test`**: Adding missing tests or correcting existing tests.
- **`build`**: Changes that affect the build system or external dependencies (e.g., `package.json`, `requirements.txt`).
- **`ci`**: Changes to CI configuration files and scripts.
- **`chore`**: Other changes that don't modify src or test files.
- **`revert`**: Reverting a previous commit.

### Style Rules:
- The description must be in the **imperative, present tense** (e.g., "add test", not "added test" or "adds test").
- Do not capitalize the first letter of the description.
- Do not end the description with a period.

---

## 3. Pull Request Standards

All pull requests must follow the template defined in `.github/PULL_REQUEST_TEMPLATE.md`:

### PR Description structure:
1. **Description**: Concise summary of what has changed, the reasoning behind the changes, and any context or motivation.
2. **Type of change**: Select checkboxes representing the types of changes (Bug fix, New feature, Breaking change, Refactor, Docs).
3. **How Has This Been Tested?**: Concrete commands run, test file references, and verification logs showing that the changes work.
4. **Checklist**: Validate compliance with project style guidelines, self-reviews, and test suite execution.
