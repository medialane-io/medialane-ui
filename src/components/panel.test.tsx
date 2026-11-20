import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";

const { Panel, Pill, panelBackground } = await import("./panel.js");

afterEach(() => cleanup());

test("a neutral panel uses the shared panel class without an inline background", () => {
  const { getByText } = render(<Panel className="p-4">Neutral</Panel>);
  const panel = getByText("Neutral");
  expect(panel.className).toContain("panel");
  expect(panel.getAttribute("style") ?? "").not.toContain("gradient");
});

test("a brand panel fades one brand colour, or blends a pair, to transparent", () => {
  expect(panelBackground("rose")).toBe("linear-gradient(to bottom right, hsl(var(--brand-rose) / 0.32), transparent)");
  expect(panelBackground(["orange", "maeve"])).toBe(
    "linear-gradient(to bottom right, hsl(var(--brand-orange) / 0.32), hsl(var(--brand-maeve) / 0.16), transparent)",
  );
});

test("a panel is borderless and keeps the caller's classes and styles", () => {
  const { getByText } = render(
    <Panel tone="blue" className="p-4" style={{ minHeight: 10 }}>
      Body
    </Panel>,
  );
  const panel = getByText("Body");
  expect(panel.className).toContain("panel");
  expect(panel.className).toContain("p-4");
  expect(panel.className).not.toContain("border");
  expect(panel.className).not.toContain("ring");
  expect(panel.style.minHeight).toBe("10px");
});

test("a pill uses the brand colour for its text, or muted text without one", () => {
  const { getByText } = render(
    <>
      <Pill color="purple">Tinted</Pill>
      <Pill>Plain</Pill>
    </>,
  );
  expect(getByText("Tinted").className).toContain("text-brand-purple");
  expect(getByText("Plain").className).toContain("text-muted-foreground");
  expect(getByText("Plain").className).not.toContain("border");
});
