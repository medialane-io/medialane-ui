import { describe, expect, test } from "bun:test";
import { notificationsAreLoading } from "./notification-readiness.js";

const loaded = { ordersLoading: false, receivedLoading: false, activitiesLoading: false, hasAddress: true };

describe("when the notification sources are ready to be judged", () => {
  test("they are not ready while the wallet's own orders are still arriving", () => {
    expect(notificationsAreLoading({ ...loaded, ordersLoading: true })).toBe(true);
  });

  test("they are not ready while received offers are still arriving", () => {
    expect(notificationsAreLoading({ ...loaded, receivedLoading: true })).toBe(true);
  });

  test("they are not ready while activity is still arriving", () => {
    expect(notificationsAreLoading({ ...loaded, activitiesLoading: true })).toBe(true);
  });

  test("they are ready once every source has answered", () => {
    expect(notificationsAreLoading(loaded)).toBe(false);
  });

  test("announcements arriving first does not make them ready, because announcements are not a source here", () => {
    expect(notificationsAreLoading({ ordersLoading: true, receivedLoading: true, activitiesLoading: true, hasAddress: true })).toBe(true);
  });

  test("with nobody signed in there is nothing to wait for", () => {
    expect(notificationsAreLoading({ ordersLoading: true, receivedLoading: true, activitiesLoading: true, hasAddress: false })).toBe(false);
  });
});
