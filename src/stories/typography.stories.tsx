import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "Foundations/Typography",
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj;

type Row = {
  name: string;
  size: string;
  leading: string;
  tracking: string;
  weight: string;
  className: string;
};

const scale: Row[] = [
  {
    name: "Display",
    size: "60px",
    leading: "1.0",
    tracking: "-0.04em",
    weight: "800",
    className: "text-6xl font-extrabold tracking-[-0.04em] leading-none",
  },
  {
    name: "Title",
    size: "36px",
    leading: "1.1",
    tracking: "-0.03em",
    weight: "700",
    className: "text-4xl font-bold tracking-[-0.03em] leading-[1.1]",
  },
  {
    name: "Heading",
    size: "24px",
    leading: "1.2",
    tracking: "-0.02em",
    weight: "600",
    className: "text-2xl font-semibold tracking-[-0.02em] leading-[1.2]",
  },
  {
    name: "Subheading",
    size: "18px",
    leading: "1.4",
    tracking: "-0.01em",
    weight: "600",
    className: "text-lg font-semibold tracking-[-0.01em]",
  },
  {
    name: "Body",
    size: "16px",
    leading: "1.7",
    tracking: "0",
    weight: "400",
    className: "text-base leading-[1.7]",
  },
  {
    name: "Small",
    size: "13px",
    leading: "1.4",
    tracking: "0",
    weight: "400",
    className: "text-sm",
  },
  {
    name: "Caption",
    size: "12px",
    leading: "1.4",
    tracking: "0.04em",
    weight: "500",
    className: "text-xs font-medium tracking-[0.04em] uppercase text-muted-foreground",
  },
];

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">{children}</div>
);

const Section = ({ label, title, children }: { label: string; title: string; children: React.ReactNode }) => (
  <section className="border-t border-border px-8 py-16 md:px-16">
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 flex items-baseline justify-between gap-6">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
        <Eyebrow>{label}</Eyebrow>
      </div>
      {children}
    </div>
  </section>
);

export const Specimen: Story = {
  render: () => (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <header className="relative overflow-hidden px-8 pt-20 pb-16 md:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 text-[28rem] leading-none font-extrabold tracking-[-0.06em] text-primary/[0.06] select-none"
        >
          Aa
        </div>
        <div className="relative mx-auto max-w-5xl">
          <Eyebrow>Foundations — Type</Eyebrow>
          <h1 className="mt-6 text-6xl font-extrabold tracking-[-0.045em] text-balance md:text-8xl">
            Manrope
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-[1.6] text-muted-foreground text-pretty">
            A variable grotesque with generous counters and quiet personality. Paired with{" "}
            <span className="font-mono text-lg text-foreground">IBM Plex Mono</span> for code, keys, and data.
          </p>
          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              ["Weights", "200–800"],
              ["Axes", "wght"],
              ["Sizes", "7"],
              ["Base", "16px"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">{k}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Glyphs */}
      <Section label="Glyphs" title="Letterforms">
        <div className="rounded-xl border border-border bg-card p-8">
          <p className="text-4xl leading-[1.5] font-medium tracking-[-0.02em] break-words">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <br />
            <span className="text-muted-foreground">abcdefghijklmnopqrstuvwxyz</span>
            <br />
            <span className="font-mono text-3xl text-primary">0123456789 &amp; @ # % — → ⌘ ✓</span>
          </p>
        </div>
      </Section>

      {/* Scale */}
      <Section label="Scale" title="Type scale">
        <div className="divide-y divide-border border-y border-border">
          {scale.map((row) => (
            <div key={row.name} className="grid grid-cols-1 gap-4 py-7 md:grid-cols-[9rem_1fr]">
              <div className="pt-1">
                <div className="text-sm font-semibold">{row.name}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {row.size} / {row.leading} · {row.weight}
                  <br />
                  {row.tracking === "0" ? "tracking normal" : `tracking ${row.tracking}`}
                </div>
              </div>
              <div className={`${row.className} min-w-0 truncate`}>Systems are decisions, written down</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Weights */}
      <Section label="wght" title="Weight axis">
        <div className="space-y-1">
          {[
            ["ExtraLight", "font-extralight"],
            ["Light", "font-light"],
            ["Regular", "font-normal"],
            ["Medium", "font-medium"],
            ["SemiBold", "font-semibold"],
            ["Bold", "font-bold"],
            ["ExtraBold", "font-extrabold"],
          ].map(([label, cls]) => (
            <div key={label} className="group flex items-baseline gap-6 rounded-md px-3 py-2 hover:bg-muted">
              <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
              <span className={`${cls} text-3xl tracking-[-0.02em]`}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Inline */}
      <Section label="Inline" title="Inline elements">
        <div className="grid gap-8 md:grid-cols-2">
          <p className="text-base leading-[1.8]">
            Body text carries <strong className="font-semibold">strong emphasis</strong>, <em className="italic">italics</em>,{" "}
            <a href="#" className="font-medium text-primary decoration-primary/40 underline underline-offset-4 hover:decoration-primary">
              links
            </a>
            , <mark className="rounded-sm bg-warning/25 px-1">highlights</mark>, and{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">inline code</code> without breaking
            rhythm. Footnotes ride along too<sup className="ml-0.5 text-xs text-muted-foreground">1</sup>.
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              {["⌘", "⇧", "K"].map((k) => (
                <kbd
                  key={k}
                  className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-border bg-card px-2 font-mono text-xs shadow-[0_1px_0_var(--color-border)]"
                >
                  {k}
                </kbd>
              ))}
              <span className="text-sm text-muted-foreground">to open the palette</span>
            </div>
            <blockquote className="border-l-2 border-primary pl-5 text-lg leading-[1.6] italic text-pretty">
              Simplicity is about the right thing, in the right place, for the right reasons.
            </blockquote>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4">
              <code className="font-mono text-sm">{`--color-primary: #a14c2f;
--text-sm: 13px;`}</code>
            </pre>
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const Article: Story = {
  render: () => (
    <div className="bg-background px-8 py-20 text-foreground md:px-16">
      <article className="mx-auto max-w-[68ch]">
        <Eyebrow>Design systems · 6 min read</Eyebrow>
        <h1 className="mt-5 text-5xl font-extrabold tracking-[-0.04em] text-balance">
          The joy of designing systems
        </h1>
        <p className="mt-5 text-xl leading-[1.6] text-muted-foreground text-pretty">
          A short guide to building interfaces that feel considered, consistent, and calm.
        </p>

        <hr className="my-10 border-border" />

        <p className="text-lg leading-[1.75] first-letter:mr-2 first-letter:float-left first-letter:text-6xl first-letter:leading-[0.8] first-letter:font-extrabold first-letter:text-primary">
          Every interface is a set of decisions made in advance, so that the people using it don&apos;t have to make
          them again. A design system is just that set of decisions, written down and made reusable — a shared
          vocabulary for the whole team. It is <strong className="font-semibold">not optional polish</strong>; it is{" "}
          <em className="italic">the</em> product, as much as any feature is.
        </p>

        <h2 className="mt-14 text-3xl font-bold tracking-[-0.03em]">Start with the tokens</h2>
        <p className="mt-5 leading-[1.8]">
          Colors, spacing, radii, and type scale come first. Everything else — buttons, dialogs, forms — is
          composition on top of those primitives. Get the tokens right and the components mostly fall into place.
        </p>

        <blockquote className="my-10 border-l-2 border-primary pl-6 text-xl leading-[1.6] italic text-pretty">
          Add a primitive when a real pattern has repeated three times. Not before.
        </blockquote>

        <h3 className="mt-12 text-xl font-semibold tracking-[-0.02em]">What belongs in the base layer</h3>
        <ul className="mt-5 space-y-2.5 leading-[1.7]">
          {[
            "Semantic color tokens — background, foreground, primary, destructive",
            "A type scale with few sizes and fewer weights",
            "Spacing and radius scales reused everywhere",
            "A handful of composable primitives, not a hundred one-offs",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-12 text-xl font-semibold tracking-[-0.02em]">Rollout order</h3>
        <ol className="mt-5 space-y-3 leading-[1.7]">
          {[
            <>
              Define the token layer in{" "}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">globals.css</code>
            </>,
            <>Build the primitives: button, input, dialog</>,
            <>Assemble screens from primitives, not the other way around</>,
          ].map((item, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>

        <h2 className="mt-14 text-3xl font-bold tracking-[-0.03em]">Reference</h2>
        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Token</th>
                <th className="px-4 py-3 text-left font-semibold">Value</th>
                <th className="px-4 py-3 text-left font-semibold">Usage</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["--color-primary", "#a14c2f", "Primary buttons, links"],
                ["--color-border", "#d7d0c4", "Dividers, outlines"],
                ["--text-sm", "13px", "Dense UI, captions"],
              ].map(([token, value, usage]) => (
                <tr key={token} className="border-t border-border">
                  <td className="px-4 py-3 font-mono">{token}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{value}</td>
                  <td className="px-4 py-3">{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-14 text-3xl font-bold tracking-[-0.03em]">Keep it small</h2>
        <p className="mt-5 leading-[1.8]">
          A system that anticipates every future need becomes its own maintenance burden
          <sup className="ml-0.5 text-xs text-muted-foreground">1</sup>. Complexity compounds: every added surface is
          something everyone downstream has to learn.
        </p>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          {[
            ["YAGNI", "You aren't gonna need it — build for the problem in front of you."],
            ["DRY", "Don't repeat yourself — but only once a pattern has actually repeated."],
          ].map(([term, def]) => (
            <div key={term} className="rounded-xl border border-border bg-card p-5">
              <dt className="font-mono text-xs tracking-[0.14em] uppercase text-primary">{term}</dt>
              <dd className="mt-2 text-sm leading-[1.6] text-muted-foreground">{def}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          <sup className="text-xs">1</sup> Measured in the questions new contributors have to ask before their first
          commit.
        </p>
      </article>
    </div>
  ),
};
