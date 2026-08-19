# Navbar

`Navbar` is a composable application header for workspaces, dashboards, and developer tools. The root owns active navigation state; the attached building blocks only render their own surface.

## Building blocks

```tsx
import { Bell } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

<Navbar defaultActiveKey="overview">
  <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
    <Navbar.Brand name="Northstar" eyebrow="Workspace" />
    <Navbar.Nav>
      <Navbar.Item itemKey="overview">Overview</Navbar.Item>
      <Navbar.Item itemKey="activity">Activity</Navbar.Item>
    </Navbar.Nav>
    <Navbar.Actions>
      <Navbar.IconButton label="Notifications" icon={Bell} />
      <Navbar.Profile />
    </Navbar.Actions>
  </div>
</Navbar>
```

The same pieces are also available as named exports when a consumer prefers direct imports:

```tsx
import { NavbarActions, NavbarBrand, NavbarItem, NavbarNav, NavbarRoot } from "@/components/ui/navbar";
```

Available pieces are `NavbarBrand`, `NavbarNav`, `NavbarItem`, `NavbarSearch`, `NavbarActions`, `NavbarIconButton`, `NavbarProfile`, `NavbarDivider`, `NavbarContext`, and `NavbarStatus`.

## Composed variants

Use the Storybook stories as working examples:

- `Default` combines brand, primary navigation, search, notifications, and profile.
- `CommandCenter` uses a two-row command surface with a wide search field.
- `CompactWorkspace` keeps the same contract in a shorter, denser header.
- `MinimalCenter` puts the primary navigation in the visual center and keeps actions quiet.
- `ProjectContext` adds a contextual project slot between the brand and navigation.

Prefer composing a new arrangement with slots and class names over adding a boolean prop to `Navbar`. Use `variant="command"` or `variant="compact"` only when the root height and responsive sizing need to change together.

## Active state

`Navbar` supports controlled and uncontrolled active navigation:

```tsx
<Navbar activeKey={activeKey} onActiveKeyChange={setActiveKey}>
  {/* ... */}
</Navbar>
```

Each `Navbar.Item` needs a unique `itemKey`. The active item exposes `aria-current="page"` and a reduced-motion-safe animated underline.
