# ui

Personal UI component library, developed in Storybook and distributed as a
[shadcn registry](https://ui.shadcn.com/docs/registry/github).

Opinionated, composable building blocks for React 19 + Tailwind CSS v4:
compound components with context selectors instead of prop drilling, animated
with framer-motion, themed through shadcn design tokens. Built to cover real
app surfaces — app shells, sidebars, command palettes, data tables — not just
leaf widgets.

## Components

alert · app-shell · avatar · badge · button · card · checkbox · command ·
dialog · input · input-otp · kbd · navbar · progress · radio-group ·
separator · sidebar · skeleton · switch · table · tabs · textarea

Browse them live in Storybook (see [Development](#development)).

## Installing components into another project

Prerequisites in the target project:

1. Tailwind CSS v4 set up.
2. The theme tokens: `npx shadcn@latest add lkarasinski/ui/theme`
3. The `cn()` helper: `npx shadcn@latest add lkarasinski/ui/utils`

Then add any component:

```sh
npx shadcn@latest add lkarasinski/ui/button
```

Every component depends on `utils`, and most expect the tokens from `theme`.
Components with internal dependencies pull them in automatically via the
registry (e.g. `command` installs `kbd`, `progress` and `skeleton`).

Pin to a tag or commit with `#ref`, e.g.
`npx shadcn@latest add lkarasinski/ui/button#v1.0.0`.

## Development

```sh
bun install
bun run storybook
```

Components live in `src/components/ui`, one file per component next to its
Storybook stories. Design tokens and typography live in `src/globals.css`.

After changing components or `registry.json`, verify the registry still
builds:

```sh
bunx shadcn@latest build --output /tmp/r
```

## License

[MIT](LICENSE)
