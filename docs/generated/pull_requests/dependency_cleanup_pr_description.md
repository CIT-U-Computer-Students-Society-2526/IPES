## Description

This pull request standardizes the project's toast notification system on **Sonner** and prunes unused Shadcn UI wrapper components and package dependencies.

Key enhancements and modifications:
1. **Toast Notification Unification**: Replaced the custom Radix UI toast implementation with a unified `sonner` toast system. All frontend views (`SelectOrganization.tsx`, `AdminAccomplishments.tsx`, `Analytics.tsx`, `Assignments.tsx`, `AuditLog.tsx`, `FormBuilder.tsx`, `Organization.tsx`, `Settings.tsx`, `Users.tsx`, `Accomplishments.tsx`, `EvaluationForm.tsx`) have been refactored to use Sonner toast. Deleted `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`, `src/components/ui/use-toast.ts`, and `src/hooks/use-toast.ts`.
2. **Unused Component Cleanup**: Deleted 14 unused Shadcn wrapper components from `src/components/ui/` (such as `accordion.tsx`, `aspect-ratio.tsx`, `carousel.tsx`, `command.tsx`, etc.). Active components `@radix-ui/react-radio-group` and `@radix-ui/react-alert-dialog` were identified and preserved.
3. **Redundant Packages Pruned**: Uninstalled 15 unused package dependencies to reduce bundle size and maintain dependencies cleanly.
4. **Documentation**: Documented audit results in `docs/generated/implementation_plans/20260701/audit_dependencies_plan_rafael.md` and added reusable plans and git-commit-and-pr guidelines under `.agents/skills/`.

Fixes # (issue)

---

## Type of change

- [x] This change requires a documentation update
- [x] Refactor (Changes that do not add functionality or fix a bug)

---

## How Has This Been Tested?

Tested locally to ensure that the React code compiles properly and all test suites remain functional.

- **Test A**: Run frontend test suites locally via `npm test -- --run` to verify that routing contexts and API requests are intact.
- **Test B**: Compile frontend production assets via `npm run build` to verify that rollup/vite resolve all component pathways successfully.

---

## Checklist:

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have made corresponding changes to the documentation
- [x] New and existing unit tests pass locally with my changes
