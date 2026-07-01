# Project Dependency Audit & Remediation Plan

This implementation plan documents the current status of all project dependencies in the IPES (Individual Performance Evaluation System) codebase, identifies redundancies/duplications (especially frontend dependencies introduced during the initial Lovable bootstrapping phase), and outlines a remediation strategy to clean up the codebase.

---

## 1. Executive Summary

During the initial prototyping and bootstrapping phase with **Lovable**, the codebase was equipped with a full suite of Shadcn UI components and dependencies. Some of these dependencies are redundant, duplicate existing functionality, or are completely unused by the active page layouts.

This plan details:
1. **Backend Dependencies Audit**: 7 dependencies, all verified as used.
2. **Frontend Dependencies Audit**: 51 dependencies, with 13 identified as completely unused in pages, and 1 functional duplication.
3. **Remediation Plan**: Standardizing the toast system, pruning unused dependencies and UI components, and validating application state.

---

## 2. Dependency Analysis & Audit

### 2.1 Backend Dependencies (`requirements.txt`)

All backend dependencies are active and required by the Django 6.0 application:

| Package | Version | Purpose | Usage Status |
| :--- | :--- | :--- | :--- |
| `python-decouple` | standard | Parses `.env` configuration files for secret management. | **Active** (Used in `IPES/settings.py` for database URL, secret key, etc.) |
| `psycopg[binary]` | standard | PostgreSQL adapter for Python database connectivity. | **Active** (Used by Django ORM to connect to Supabase database) |
| `pillow` | standard | Image processing library. | **Active** (Used for user profiles/accomplishment verification documents) |
| `django-cors-headers`| standard | Middleware to handle Cross-Origin Resource Sharing. | **Active** (Enables React SPA communication across different ports/domains) |
| `djangorestframework`| standard | Django REST Framework toolkit for building Web APIs. | **Active** (Underlies all custom API endpoints, serializers, and viewsets) |
| `flake8` | standard | Python linter for code style enforcement. | **Active** (Runs in CI and local verification scripts) |
| `gunicorn` | standard | WSGI HTTP Server for production deployment. | **Active** (Production runner command) |

### 2.2 Frontend Dependencies (`package.json`)

The React application uses a combination of core libraries, Radix primitives, and formatting utilities. The audit has classified them into **Used**, **Duplicate (Overlapping)**, and **Unused (Redundant)**:

#### Core, State, Routing & Utilities (All Active)
| Package | Version | Purpose | Usage Status |
| :--- | :--- | :--- | :--- |
| `react` / `react-dom` | `^18.3.1` | Core React framework. | **Active** (Core framework) |
| `react-router-dom` | `^7.16.0` | Client-side routing. | **Active** (Main routing config in `App.tsx`) |
| `@tanstack/react-query` | `^5.83.0` | Asynchronous state management and data fetching. | **Active** (Used in custom api hooks `/hooks/*.ts`) |
| `react-hook-form` | `^7.61.1` | Form state management and submission handler. | **Active** (All dynamic evaluation and setup forms) |
| `zod` | `^4.4.3` | Schema validation. | **Active** (Forms schema validation and typescript type inference) |
| `@hookform/resolvers` | `^3.10.0` | Validation resolver glue between React Hook Form and Zod. | **Active** (All form validations) |
| `lucide-react` | `^0.462.0` | SVG icons library. | **Active** (UI icon components) |
| `next-themes` | `^0.3.0` | Theme configuration (Dark/Light mode). | **Active** (Used by `theme-provider.tsx` and toast configurations) |
| `date-fns` | `^3.6.0` | Date manipulation and formatting library. | **Active** (Used in date rendering, deadlines, period setups) |
| `react-day-picker` | `^10.0.1` | Calendar rendering library. | **Active** (Used in date picker forms) |
| `recharts` | `^2.15.4` | Visual charts/data visualization. | **Active** (Used in `pages/admin/Analytics.tsx` for admin charts) |
| `@lottiefiles/dotlottie-react` | `^0.17.14` | High performance animation rendering. | **Active** (Used in `AuthLayout.tsx` for login screen animations) |
| `@dnd-kit/core` | `^6.3.1` | Drag-and-drop primitives. | **Active** (Used in FormBuilder layout config) |
| `@dnd-kit/sortable` | `^10.0.0` | Sortable list helper for dnd-kit. | **Active** (Used in FormBuilder layout config) |
| `@dnd-kit/utilities` | `^3.2.2` | Helper functions for dnd-kit. | **Active** (Used in FormBuilder layout config) |
| `class-variance-authority` | `^0.7.1` | Class name variant mapping. | **Active** (Used in component designs, e.g., `button.tsx`) |
| `clsx` | `^2.1.1` | Conditional class name toggler. | **Active** (Used in `cn` style merger function) |
| `tailwind-merge` | `^3.6.0` | Class name resolver to prevent style clashes. | **Active** (Used in `cn` style merger function) |
| `tailwindcss-animate` | `^1.0.7` | Keyframe-based animations plugin. | **Active** (Used in `tailwind.config.ts`) |
| `@radix-ui/react-alert-dialog`| `^1.1.14` | Confirmation dialog primitives. | **Active** (Used in Settings and User management) |
| `@radix-ui/react-radio-group` | `^1.3.7` | Custom radio selections. | **Active** (Used in Evaluation Form rating component) |

#### Overlapping / Duplicating Functionality
| Package | Version | Purpose | Usage Status |
| :--- | :--- | :--- | :--- |
| `@radix-ui/react-toast` | `^1.2.14` | Shadcn standard toast system. | **Duplicate** (Used via `useToast` in most views) |
| `sonner` | `^1.7.4` | Opinionated rich toast notification library. | **Duplicate** (Used in `ProfileEditorDialog.tsx`) |

*Rationale:* The project currently utilizes both toast systems. Having multiple toast notification engines leads to inconsistent UI, double styling configurations, and increased bundle size.

#### Unused / Redundant Packages (Safe to Prune)
These packages are listed in `package.json` but are not imported or referenced in any active page or component code, apart from their own local Shadcn UI wrappers:

| Package | Version | Purpose | Remediation |
| :--- | :--- | :--- | :--- |
| `@radix-ui/react-accordion` | `^1.2.11` | Accordion primitives. | Remove component + package. |
| `@radix-ui/react-aspect-ratio`| `^1.1.7` | Aspect ratio utility. | Remove component + package. |
| `@radix-ui/react-context-menu` | `^2.2.15` | Right-click menus. | Remove component + package. |
| `@radix-ui/react-hover-card` | `^1.1.14` | Hover preview cards. | Remove component + package. |
| `@radix-ui/react-menubar` | `^1.1.15` | Menu bars. | Remove component + package. |
| `@radix-ui/react-navigation-menu`| `^1.2.13` | Nav bars. | Remove component + package. |
| `@radix-ui/react-slider` | `^1.3.5` | Range sliders. | Remove component + package. |
| `@radix-ui/react-toggle` | `^1.1.9` | Toggle states. | Remove component + package. |
| `@radix-ui/react-toggle-group` | `^1.1.10` | Groups of toggles. | Remove component + package. |
| `cmdk` | `^1.1.1` | Command menu primitive. | Remove component + package. |
| `embla-carousel-react` | `^8.6.0` | Carousel engine. | Remove component + package. |
| `input-otp` | `^1.4.2` | One-time password inputs. | Remove component + package. |
| `react-resizable-panels` | `^2.1.9` | Split views and resizable panels. | Remove component + package. |
| `vaul` | `^1.1.2` | Bottom drawers. | Remove component + package. |

---

## 3. Remediation & Cleanup Strategy

To clean up the codebase and eliminate redundancies, the following refactoring steps are proposed:

### 3.1 Step 1: Standardize the Toast System
We will unify the notifications around **Sonner** as it provides a superior developer experience and features compared to `@radix-ui/react-toast`.
1. Update views that use `useToast` (from `@/hooks/use-toast` / `@/components/ui/use-toast`) to use `toast` from `sonner` directly.
2. Remove `@radix-ui/react-toast` from `package.json`.
3. Delete files:
   - `frontend/src/components/ui/toast.tsx`
   - `frontend/src/components/ui/toaster.tsx`
   - `frontend/src/components/ui/use-toast.ts`
   - `frontend/src/hooks/use-toast.ts` (if duplicate)

### 3.2 Step 2: Prune Unused UI Components
Delete the unused UI wrapper components from `frontend/src/components/ui/`:
- `accordion.tsx`
- `aspect-ratio.tsx`
- `carousel.tsx`
- `command.tsx`
- `context-menu.tsx`
- `drawer.tsx`
- `hover-card.tsx`
- `input-otp.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `resizable.tsx`
- `slider.tsx`
- `toggle-group.tsx`
- `toggle.tsx`

### 3.3 Step 3: Package Uninstallation
Uninstall the pruned packages from `package.json` and update `package-lock.json` and `bun.lockb` by running:
```bash
npm uninstall @radix-ui/react-accordion @radix-ui/react-aspect-ratio @radix-ui/react-context-menu @radix-ui/react-hover-card @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-slider @radix-ui/react-toggle @radix-ui/react-toggle-group cmdk embla-carousel-react input-otp react-resizable-panels vaul @radix-ui/react-toast
```

---

## 4. Verification Plan

### 4.1 Automated Tests
Verify that pruning does not break components or existing test cases:
1. Run backend tests:
   ```bash
   python manage.py test
   ```
2. Run frontend tests:
   ```bash
   cd frontend
   npm run test
   ```

### 4.2 Manual Verification
- Build the frontend production bundle to ensure no compile-time import errors occur:
  ```bash
  cd frontend
  npm run build
  ```
- Run the dev server (`npm run dev`) and test basic flows (creating evaluations, displaying profiles, and editing profiles) to confirm that the unified Sonner notifications render correctly.
