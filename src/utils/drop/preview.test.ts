import { afterEach, expect, test } from "bun:test";
import { previewUrl } from "./preview.js";

const original = URL.createObjectURL;
afterEach(() => { URL.createObjectURL = original; });

test("a file gets one preview URL however often the form re-renders", () => {
  let made = 0;
  URL.createObjectURL = (() => `blob:${++made}`) as typeof URL.createObjectURL;
  const a = new File(["a"], "a.png");
  const b = new File(["b"], "b.png");
  expect(previewUrl(a)).toBe("blob:1");
  expect(previewUrl(a)).toBe("blob:1");
  expect(previewUrl(b)).toBe("blob:2");
  expect(made).toBe(2);
});
