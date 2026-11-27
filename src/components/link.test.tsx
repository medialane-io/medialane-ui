import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import Link from "./link.js";
import { I18nProvider } from "../i18n/provider.js";

const href = (container: HTMLElement) => container.querySelector("a")?.getAttribute("href");

test("Link renders /marketplace as /pt/marketplace under pt", () => {
  const { container } = render(
    <I18nProvider locale="pt" messages={{}}>
      <Link href="/marketplace">Trade</Link>
    </I18nProvider>,
  );
  expect(href(container)).toBe("/pt/marketplace");
});

test("Link prefixes the pathname of an object href", () => {
  const { container } = render(
    <I18nProvider locale="pt" messages={{}}>
      <Link href={{ pathname: "/search", query: { q: "x" } }}>Search</Link>
    </I18nProvider>,
  );
  expect(href(container)).toBe("/pt/search?q=x");
});

test("Link leaves the default language unprefixed", () => {
  const { container } = render(
    <I18nProvider locale="en" messages={{}}>
      <Link href="/marketplace">Trade</Link>
    </I18nProvider>,
  );
  expect(href(container)).toBe("/marketplace");
});

test("Link leaves absolute, mailto, hash and already-prefixed hrefs untouched", () => {
  for (const target of ["https://example.com/a", "mailto:a@b.co", "#top", "/pt/marketplace"]) {
    const { container } = render(
      <I18nProvider locale="pt" messages={{}}>
        <Link href={target}>x</Link>
      </I18nProvider>,
    );
    expect(href(container)).toBe(target);
  }
});

test("without a provider Link renders the same href as next/link", () => {
  const { container } = render(<Link href="/marketplace">Trade</Link>);
  expect(href(container)).toBe("/marketplace");
});

test("Link passes its ref and extra props to the anchor", () => {
  const anchors: Array<HTMLAnchorElement | null> = [];
  const { container } = render(
    <Link href="/a" className="c" ref={(node) => { anchors.push(node); }}>
      A
    </Link>,
  );
  expect(anchors[0]).toBe(container.querySelector("a"));
  expect(container.querySelector("a")?.className).toBe("c");
});

function nextLinkProps(props: { href: string; prefetch?: boolean }) {
  const inner = (Link as unknown as { render: (p: object, r: null) => { props: { prefetch?: boolean } } }).render;
  let seen: { prefetch?: boolean } = {};
  function Probe() {
    const element = inner(props, null);
    seen = element.props;
    return element as unknown as React.ReactElement;
  }
  render(<Probe />);
  return seen;
}

test("Link does not prefetch unless asked", () => {
  expect(nextLinkProps({ href: "/asset/starknet/0x1/1" }).prefetch).toBe(false);
});

test("Link keeps an explicit prefetch choice", () => {
  expect(nextLinkProps({ href: "/marketplace", prefetch: true }).prefetch).toBe(true);
});
