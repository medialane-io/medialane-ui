import { describe, expect, test } from "bun:test";
import { LAUNCHPAD_SERVICE_DEFINITIONS } from "./launchpad-services";

const example = (key: string) => LAUNCHPAD_SERVICE_DEFINITIONS.find((d) => d.key === key)?.example ?? "";

describe("the example addresses on the claim cards", () => {
  test("a username claim shows the creator page address", () => {
    expect(example("claim-username")).toContain("medialane.io/creator/");
  });

  test("a collection name claim shows the singular collection page address", () => {
    expect(example("claim-collection-name")).toContain("medialane.io/collection/your-collection");
    expect(example("claim-collection-name")).not.toContain("/collections/");
  });
});
