import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";

mock.module("next/image", () => ({
  default: ({ src, alt, className, onError, onLoad }: { src: string; alt: string; className?: string; onError?: () => void; onLoad?: () => void }) => (
    <img src={src} alt={alt} className={className} onError={onError} onLoad={onLoad} />
  ),
}));

const { default: Image } = await import("./image.js");

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

test("a failed image is requested again after five seconds", () => {
  const { container } = render(<Image src="/a.jpg" alt="a" width={10} height={10} />);
  const first = container.querySelector("img")!;
  fireEvent.error(first);
  expect(container.querySelector("img")!.className).toContain("invisible");
  act(() => { jest.advanceTimersByTime(4999); });
  expect(container.querySelector("img")).toBe(first);
  act(() => { jest.advanceTimersByTime(1); });
  expect(container.querySelector("img")).not.toBe(first);
});

test("a retried image shows once it loads", () => {
  const { container } = render(<Image src="/a.jpg" alt="a" width={10} height={10} />);
  fireEvent.error(container.querySelector("img")!);
  act(() => { jest.advanceTimersByTime(5000); });
  fireEvent.load(container.querySelector("img")!);
  expect(container.querySelector("img")!.className).not.toContain("invisible");
});

test("the caller's onError runs only after the retries are used up", () => {
  const failed = jest.fn();
  const { container } = render(<Image src="/a.jpg" alt="a" width={10} height={10} onError={failed} />);
  for (let i = 0; i < 6; i++) {
    fireEvent.error(container.querySelector("img")!);
    expect(failed).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(5000); });
  }
  fireEvent.error(container.querySelector("img")!);
  expect(failed).toHaveBeenCalledTimes(1);
});
