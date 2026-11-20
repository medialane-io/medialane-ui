import { afterEach, expect, test } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { IpfsGatewayFallback } from "./ipfs-gateway-fallback.js";
import { DEFAULT_GATEWAY } from "../utils/ipfs.js";
import { PUBLIC_IMAGE_GATEWAYS } from "../utils/ipfs-gateway-fallback.js";

const PRIMARY = "https://example.mypinata.cloud/ipfs/";
const FIRST_PUBLIC = PUBLIC_IMAGE_GATEWAYS[0]!;

afterEach(() => cleanup());

test("a React-rendered image from the primary gateway switches to the first public gateway, and its onError does not run", async () => {
  let errors = 0;
  const { container } = render(
    <>
      <IpfsGatewayFallback primary={PRIMARY} />
      <img src={`${PRIMARY}QmA/1.jpg?img-width=600`} alt="" onError={() => { errors++; }} />
    </>,
  );
  const img = container.querySelector("img")!;
  await act(async () => { img.dispatchEvent(new Event("error")); });
  expect(img.getAttribute("src")).toBe(`${FIRST_PUBLIC}QmA/1.jpg`);
  expect(errors).toBe(0);
});

test("with no primary gateway configured, images from the default gateway fall back too", async () => {
  const { container } = render(
    <>
      <IpfsGatewayFallback primary={null} />
      <img src={`${DEFAULT_GATEWAY}QmA/1.jpg`} alt="" />
    </>,
  );
  const img = container.querySelector("img")!;
  await act(async () => { img.dispatchEvent(new Event("error")); });
  expect(img.getAttribute("src")).not.toBe(`${DEFAULT_GATEWAY}QmA/1.jpg`);
  expect(img.getAttribute("src")!.endsWith("QmA/1.jpg")).toBe(true);
});
