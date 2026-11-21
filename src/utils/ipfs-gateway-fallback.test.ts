import { afterEach, describe, expect, test } from "bun:test";
import { IPFS_PUBLIC_GATEWAYS } from "@medialane/sdk";
import {
  PUBLIC_IMAGE_GATEWAYS,
  gatewayChain,
  gatewayFallbackSrc,
  installIpfsGatewayFallback,
} from "./ipfs-gateway-fallback.js";

const PRIMARY = "https://example.mypinata.cloud/ipfs/";
const SECOND = "https://second.example/ipfs/";
const THIRD = "https://third.example/ipfs/";
const CHAIN = [PRIMARY, SECOND, THIRD];

describe("PUBLIC_IMAGE_GATEWAYS", () => {
  test("are the SDK's public gateways, in order, ending in a slash", () => {
    expect([...PUBLIC_IMAGE_GATEWAYS]).toEqual(IPFS_PUBLIC_GATEWAYS.map((g) => `${g}/`));
  });
});

describe("gatewayChain", () => {
  test("puts the primary gateway first, then the public ones", () => {
    expect(gatewayChain(PRIMARY, [SECOND, THIRD])).toEqual(CHAIN);
  });

  test("does not list a gateway twice", () => {
    expect(gatewayChain(THIRD, [SECOND, THIRD])).toEqual([THIRD, SECOND]);
  });
});

describe("gatewayFallbackSrc", () => {
  test("moves an image to the next gateway, without the resize query", () => {
    expect(gatewayFallbackSrc(`${PRIMARY}QmA/1.jpg?img-width=1200&img-format=webp`, CHAIN)).toBe(`${SECOND}QmA/1.jpg`);
    expect(gatewayFallbackSrc(`${SECOND}QmA/1.jpg`, CHAIN)).toBe(`${THIRD}QmA/1.jpg`);
  });

  test("returns null on the last gateway", () => {
    expect(gatewayFallbackSrc(`${THIRD}QmA/1.jpg`, CHAIN)).toBeNull();
  });

  test("leaves images from anywhere else alone", () => {
    expect(gatewayFallbackSrc("/api/img?url=x", CHAIN)).toBeNull();
    expect(gatewayFallbackSrc("https://elsewhere.example/1.jpg", CHAIN)).toBeNull();
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

  test("a failed image walks the chain, and its own error handler does not run", () => {
    uninstall = installIpfsGatewayFallback(CHAIN);
    const { img, seen, fail } = failingImage(`${PRIMARY}QmA/1.jpg?img-width=600`);
    fail();
    expect(img.getAttribute("src")).toBe(`${SECOND}QmA/1.jpg`);
    fail();
    expect(img.getAttribute("src")).toBe(`${THIRD}QmA/1.jpg`);
    expect(seen).toEqual([]);
  });

  test("when the last gateway fails too, the image's own error handler runs", () => {
    uninstall = installIpfsGatewayFallback(CHAIN);
    const { seen, fail } = failingImage(`${PRIMARY}QmA/1.jpg`);
    fail();
    fail();
    fail();
    expect(seen).toEqual([`${THIRD}QmA/1.jpg`]);
  });

  function settled(img: HTMLImageElement, complete: boolean, naturalWidth = 0) {
    Object.defineProperty(img, "complete", { value: complete, configurable: true });
    Object.defineProperty(img, "naturalWidth", { value: naturalWidth, configurable: true });
  }

  test("an image that failed before it was installed switches to the next gateway on install", () => {
    const { img } = failingImage(`${PRIMARY}QmA/1.jpg?img-width=1200`);
    settled(img, true);
    uninstall = installIpfsGatewayFallback(CHAIN);
    expect(img.getAttribute("src")).toBe(`${SECOND}QmA/1.jpg`);
  });

  test("images that loaded, or are still loading, are left alone on install", () => {
    const { img: done } = failingImage(`${PRIMARY}QmA/1.jpg`);
    settled(done, true, 640);
    const { img: pending } = failingImage(`${PRIMARY}QmB/1.jpg`);
    settled(pending, false);
    uninstall = installIpfsGatewayFallback(CHAIN);
    expect(done.getAttribute("src")).toBe(`${PRIMARY}QmA/1.jpg`);
    expect(pending.getAttribute("src")).toBe(`${PRIMARY}QmB/1.jpg`);
  });

  test("images from other hosts are left to their own error handling", () => {
    uninstall = installIpfsGatewayFallback(CHAIN);
    const { img, seen, fail } = failingImage("/api/img?url=x");
    fail();
    expect(img.getAttribute("src")).toBe("/api/img?url=x");
    expect(seen).toEqual(["/api/img?url=x"]);
  });

  test("uninstalling stops the switching", () => {
    installIpfsGatewayFallback(CHAIN)();
    const { img, fail } = failingImage(`${PRIMARY}QmA/1.jpg`);
    fail();
    expect(img.getAttribute("src")).toBe(`${PRIMARY}QmA/1.jpg`);
  });
});
