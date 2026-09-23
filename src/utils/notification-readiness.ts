export interface NotificationSourceState {
  ordersLoading: boolean;
  receivedLoading: boolean;
  activitiesLoading: boolean;
  hasAddress: boolean;
}

export function notificationsAreLoading(state: NotificationSourceState): boolean {
  if (!state.hasAddress) return false;
  return state.ordersLoading || state.receivedLoading || state.activitiesLoading;
}
