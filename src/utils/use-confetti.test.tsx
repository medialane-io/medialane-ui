import { expect, mock, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";

const fired: number[] = [];
mock.module("./media-wallet/confetti.js", () => ({ fireConfetti: () => { fired.push(1); } }));

const { useConfetti } = await import("./use-confetti.js");

afterEach(() => { cleanup(); fired.length = 0; });

function Probe({ when }: { when: boolean }) {
  useConfetti(when);
  return null;
}

test("fires once each time it turns on, never while off", () => {
  const view = render(<Probe when={false} />);
  expect(fired.length).toBe(0);
  view.rerender(<Probe when />);
  view.rerender(<Probe when />);
  expect(fired.length).toBe(1);
  view.rerender(<Probe when={false} />);
  view.rerender(<Probe when />);
  expect(fired.length).toBe(2);
});
