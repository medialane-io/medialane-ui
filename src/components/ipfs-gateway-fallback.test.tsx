import { afterEach, expect, test } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { IpfsGatewayFallback } from "./ipfs-gateway-fallback.js";

const PRIMARY = "https://example.mypinata.cloud/ipfs/";
const FALLBACK = "https://gateway.pinata.cloud/ipfs/";

afterEach(() => cleanup());

test("a React-rendered image from the primary gateway switches to the fallback, and its onError does not run", async () => {
  let errors = 0;
  const { container } = render(
    <>
      <IpfsGatewayFallback primary={PRIMARY} fallback={FALLBACK} />
      <img src={`${PRIMARY}QmA/1.jpg?img-width=600`} alt="" onError={() => { errors++; }} />
    </>,
  );
  const img = container.querySelector("img")!;
  await act(async () => { img.dispatchEvent(new Event("error")); });
  expect(img.getAttribute("src")).toBe(`${FALLBACK}QmA/1.jpg`);
  expect(errors).toBe(0);
  await act(async () => { img.dispatchEvent(new Event("error")); });
  expect(errors).toBe(1);
});

test("with no primary gateway configured, nothing is installed", async () => {
  const { container } = render(
    <>
      <IpfsGatewayFallback primary={null} fallback={FALLBACK} />
      <img src={`${PRIMARY}QmA/1.jpg`} alt="" />
    </>,
  );
  const img = container.querySelector("img")!;
  await act(async () => { img.dispatchEvent(new Event("error")); });
  expect(img.getAttribute("src")).toBe(`${PRIMARY}QmA/1.jpg`);
});
