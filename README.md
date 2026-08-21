# ui

Personal UI component library, developed in Storybook and distributed as a
shadcn registry.

## Development

```sh
bun install
bun run storybook
```

Components live in `src/components/ui`, design tokens in `src/globals.css`.

## Installing components into another project

The repo root `registry.json` turns this repository into a
[shadcn registry](https://ui.shadcn.com/docs/registry/github). The repo must be
public for installs to work.

Prerequisites in the target project:

1. Tailwind CSS v4 set up.
2. The theme tokens: `npx shadcn@latest add lkarasinski/ui/theme`
3. The `cn()` helper: `npx shadcn@latest add lkarasinski/ui/utils`

Then add any component:

```sh
npx shadcn@latest add lkarasinski/ui/button
```

Every component depends on `utils`, and most expect the tokens from `theme`.
Pin to a tag or commit with `#ref`, e.g.
`npx shadcn@latest add lkarasinski/ui/button#v1.0.0`.

## Validation

After changing components or `registry.json`, verify the registry still builds:

```sh
bunx shadcn@latest build --output /tmp/r
```
