---
inclusion: always
---

# Project Development Rules

## Communication
- Always respond to the user in Russian language
- All code, comments, variable names, function names, and documentation must be written in English only
- Never mix Russian and English in code

## Technology Stack
- Framework: Fresh v2 (Deno-based web framework)
- Runtime: Deno (not Node.js)
- UI Library: Preact (not React)
- Component Library: shadcn UI adapted for Preact
- Styling: Tailwind CSS v4 with custom design tokens
- Icons: lucide-preact
- State Management: @preact/signals
- UI Primitives: radix-ui components

## Project Structure
- `/routes` - File-based routing with Fresh conventions
- `/islands` - Interactive client-side components (hydrated on client)
- `/components` - Server-side components (no interactivity)
- `/lib` - Utility functions
- `/assets` - Global styles
- `/static` - Static assets (images, icons)

## Code Conventions

### Import Aliases
- Use `@/` alias for imports from project root
- Example: `import { cn } from "@/lib/utils.ts"`

### File Extensions
- Always use `.ts` extension for TypeScript files
- Always use `.tsx` extension for TSX/JSX files
- Never omit file extensions in imports

### Component Patterns

#### Islands (Interactive Components)
- Place in `/islands` directory
- Use for components requiring client-side interactivity
- Import from radix-ui primitives when needed
- Use preact hooks from "preact/hooks"

#### Static Components
- Place in `/components` directory
- Use for server-rendered components without interactivity
- Can use class-variance-authority for variants
- Use Slot from radix-ui for polymorphic components

#### Routes
- Use `define.page()` for page components
- Use `define.handlers()` for API routes
- Access shared state via `ctx.state` (typed as State interface)
- Use `define.middleware()` for middleware functions

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` utility from `@/lib/utils.ts` for conditional classes
- Follow shadcn design system with custom color tokens
- Use `data-slot` attributes for component identification
- Dark mode is enabled by default via `.dark` class on body

### TypeScript
- Use proper TypeScript types for all functions and components
- Use `preact.ComponentProps<"element">` for component prop types
- Extend component props with intersection types when adding custom props
- Use `VariantProps` from class-variance-authority for variant props

### Naming Conventions
- Components: PascalCase (e.g., `Button`, `DialogContent`)
- Files: kebab-case for utilities, PascalCase for components
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE for true constants
- CSS custom properties: kebab-case with `--` prefix

### State Management
- Use `@preact/signals` for reactive state
- Define shared state type in `utils.ts` as `State` interface
- Access state in routes via `ctx.state`

## Development Commands
- `deno task dev` - Start development server with Vite
- `deno task build` - Build for production
- `deno task start` - Start production server
- `deno task check` - Run formatting, linting, and type checking

## Best Practices
- Keep components minimal and focused
- Prefer composition over complex components
- Use semantic HTML elements
- Ensure accessibility with proper ARIA attributes
- Follow Fresh conventions for routing and data fetching
- Use Deno-native APIs when possible
- Avoid Node.js-specific patterns

## Component Library Guidelines
- Follow shadcn component patterns
- Use radix-ui primitives for complex interactive components
- Maintain consistent styling with design tokens
- Use `data-slot` attributes for styling hooks
- Support dark mode for all components
- Include proper TypeScript types for all props

## File Organization
- Group related components in subdirectories
- Keep utility functions in `/lib`
- Place hooks in `/components/hooks`
- Organize UI components in `/components/ui` and `/islands/ui`
- Use clear, descriptive file names
