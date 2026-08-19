# AGENTS.md

Instructions for agents working in this repo.

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
