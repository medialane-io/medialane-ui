export interface TabWithPresence {
  key: string;
  href: string;
  hideWhenEmpty?: boolean;
}

export function visiblePortfolioTabs<T extends TabWithPresence>(
  tabs: ReadonlyArray<T>,
  present: Readonly<Record<string, boolean | undefined>>,
  pathname: string,
): T[] {
  return tabs.filter(
    (tab) =>
      !tab.hideWhenEmpty ||
      present[tab.key] === true ||
      pathname === tab.href ||
      pathname.startsWith(`${tab.href}/`),
  );
}
