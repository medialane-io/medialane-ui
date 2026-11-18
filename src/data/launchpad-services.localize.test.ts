import { expect, test } from "bun:test";
import { LAUNCHPAD_SERVICE_DEFINITIONS, LAUNCHPAD_SERVICE_GROUPS, localizeGroup, localizeService } from "./launchpad-services.js";

const shout = (text: string) => text.toUpperCase();

test("localizeService translates every copy field and keeps the ids, icon, status and group", () => {
  const def = LAUNCHPAD_SERVICE_DEFINITIONS.find((d) => d.key === "nfts")!;
  const out = localizeService(shout, def);
  expect(out.title).toBe(def.title.toUpperCase());
  expect(out.subtitle).toBe(def.subtitle.toUpperCase());
  expect(out.description).toBe(def.description.toUpperCase());
  expect(out.blurb).toBe(def.blurb.toUpperCase());
  expect(out.cta).toBe(def.cta.toUpperCase());
  expect(out.features).toEqual(def.features.map((f) => f.toUpperCase()));
  expect(out.example).toBe(def.example?.toUpperCase());
  expect(out.format).toEqual({ name: def.format!.name.toUpperCase(), hint: def.format!.hint.toUpperCase() });
  expect([out.key, out.icon, out.status, out.group]).toEqual([def.key, def.icon, def.status, def.group]);
});

test("localizeService leaves absent optional fields absent", () => {
  const def = { ...LAUNCHPAD_SERVICE_DEFINITIONS[0]!, example: undefined, format: undefined, browseLinkLabel: undefined };
  const out = localizeService(shout, def);
  expect(out.example).toBeUndefined();
  expect(out.format).toBeUndefined();
  expect(out.browseLinkLabel).toBeUndefined();
});

test("localizeGroup translates the title, tagline and badge", () => {
  const group = LAUNCHPAD_SERVICE_GROUPS[0]!;
  const out = localizeGroup(shout, { ...group, badge: "New" });
  expect(out).toEqual({ ...group, title: group.title.toUpperCase(), tagline: group.tagline.toUpperCase(), badge: "NEW" });
});
