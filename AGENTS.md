# AGENTS.md

Instructions for agents working in this repo.

## Project purpose

This is a personal UI library for building good-looking, hand-coded apps in Łukasz's style.
Its main job is to support vibe coding: provide carefully made, ready-to-reuse interface
blocks so new projects can start from a strong visual and interaction foundation instead of
rebuilding common surfaces from scratch.

The library should support a wide range of products, including small todo apps, single-user
developer tools, and large data-intensive dashboards with multiple users, groups, roles, and
permissions. Components should feel opinionated and coherent, while remaining adaptable to
those different contexts.

## Reusable block standard

Treat every component as a reusable block, not as a one-off screen fragment.

- Build the component in Storybook first. Stories should show the main composition, meaningful
  visual variants, responsive behavior, and important interaction states.
- Expose small composable building blocks through slots or compound components. Consumers should
  be able to keep the parts they need, reorder them where appropriate, and add project-specific
  content without forking the component.
- Design for variation deliberately. A reusable block should cover realistic density, content,
  state, and layout differences through named variants and composition. Prefer this over a large
  matrix of boolean props.
- Keep product assumptions out of the base component. Support examples such as todo items,
  developer workflows, team workspaces, dashboards, users, groups, and permissions through
  composition and data passed by the consumer.
- Separate visual structure from product behavior. When state is needed, support controlled and
  uncontrolled use where it is a real consumer concern, and keep leaf pieces simple to render
  and test.
- Treat accessibility, keyboard use, responsive layouts, reduced motion, loading, empty, error,
  disabled, and long-content states as part of the reusable API, not as follow-up work.
- Reuse the design tokens and typography in `src/globals.css`. Add a token when a value becomes
  a repeated design decision; keep one-off values rare and intentional.

## Design tokens

This is a shadcn/ui-registry-bound component library. Use standard shadcn CSS variable names
(`background`, `foreground`, `card`, `card-foreground`, `primary`, `primary-foreground`,
`secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `border`, `input`, `ring`,
`destructive`, etc.) defined in `src/globals.css` under `@theme`.

- Reach for an existing token (`bg-primary`, `text-muted-foreground`, `border-input`, ...)
  before anything else.
- If no token fits, extend `@theme` with a new named variable rather than hardcoding a value
  inline.
- Use a static/arbitrary value (`text-[13px]`, `#a14c2f`, ...) only when neither of the above
  is viable — e.g. a one-off shadow or a value with no reasonable token equivalent. Prefer
  overriding the relevant Tailwind theme scale (e.g. `--text-sm`) over an arbitrary value
  when the change should apply everywhere that utility is used.
