# Frontend Agent Rules

## Tech Stack
- Styling: Tailwind CSS
- UI Components: shadcn/ui primitives
- Icons: lucide-react

## Guidelines for Luna & Subagents
1. **Reuse Components:** Never rewrite buttons, dialogs, or dropdowns from scratch. Import existing components from `@/components/ui/`.
2. **Component Granularity:** Keep client components small. Isolate interactive state to leaf nodes.
3. **Type Safety:** Always define explicit TypeScript interfaces for props. Avoid `any`.
4. **Visual Aesthetics:** Avoid generic AI designs. Focus on clean typography, generous whitespace, and responsive mobile-first layouts.
