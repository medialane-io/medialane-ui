import { afterEach, describe, expect, test } from "bun:test";
import { gatewayFallbackSrc, installIpfsGatewayFallback } from "./ipfs-gateway-fallback.js";

const PRIMARY = "https://example.mypinata.cloud/ipfs/";
const FALLBACK = "https://gateway.pinata.cloud/ipfs/";

describe("gatewayFallbackSrc", () => {
  test("moves a primary-gateway image to the fallback gateway, without the resize query", () => {
    expect(gatewayFallbackSrc(`${PRIMARY}QmA/1.jpg?img-width=1200&img-format=webp`, PRIMARY, FALLBACK)).toBe(`${FALLBACK}QmA/1.jpg`);
  });

  test("leaves images from anywhere else alone", () => {
    expect(gatewayFallbackSrc(`${FALLBACK}QmA/1.jpg`, PRIMARY, FALLBACK)).toBeNull();
    expect(gatewayFallbackSrc("/api/img?url=x", PRIMARY, FALLBACK)).toBeNull();
  });

  test("does nothing when both gateways are the same", () => {
    expect(gatewayFallbackSrc(`${FALLBACK}QmA`, FALLBACK, FALLBACK)).toBeNull();
  });
});

describe("installIpfsGatewayFallback", () => {
  let uninstall: (() => void) | null = null;
  afterEach(() => {
    uninstall?.();
    uninstall = null;
    document.body.innerHTML = "";
  });

  function failingImage(src: string) {
    const img = document.createElement("img");
    img.setAttribute("src", src);
    const seen: string[] = [];
    img.addEventListener("error", () => seen.push(img.getAttribute("src") ?? ""));
    document.body.appendChild(img);
    const fail = () => img.dispatchEvent(new Event("error"));
    return { img, seen, fail };
  }

  test("a failed primary-gateway image switches to the fallback, and its own error handler does not run", () => {
    uninstall = installIpfsGatewayFallback(PRIMARY, FALLBACK);
    const { img, seen, fail } = failingImage(`${PRIMARY}QmA/1.jpg?img-width=600`);
    fail();
    expect(img.getAttribute("src")).toBe(`${FALLBACK}QmA/1.jpg`);
    expect(seen).toEqual([]);
  });

  test("when the fallback fails too, the image's own error handler runs", () => {
    uninstall = installIpfsGatewayFallback(PRIMARY, FALLBACK);
    const { seen, fail } = failingImage(`${PRIMARY}QmA/1.jpg`);
    fail();
    fail();
    expect(seen).toEqual([`${FALLBACK}QmA/1.jpg`]);
  });

  test("images from other hosts are left to their own error handling", () => {
    uninstall = installIpfsGatewayFallback(PRIMARY, FALLBACK);
    const { img, seen, fail } = failingImage("/api/img?url=x");
    fail();
    expect(img.getAttribute("src")).toBe("/api/img?url=x");
    expect(seen).toEqual(["/api/img?url=x"]);
  });

  test("uninstalling stops the switching", () => {
    installIpfsGatewayFallback(PRIMARY, FALLBACK)();
    const { img, fail } = failingImage(`${PRIMARY}QmA/1.jpg`);
    fail();
    expect(img.getAttribute("src")).toBe(`${PRIMARY}QmA/1.jpg`);
  });
});
