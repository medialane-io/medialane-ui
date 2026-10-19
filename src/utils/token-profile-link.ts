type ProfileLinkToken = {
  owner?: string | null;
  balances?: Array<{ owner: string; amount?: string }> | null;
  metadata?: { attributes?: unknown } | null;
};

export function tokenProfileLink(token: ProfileLinkToken): { href: string; label: string } | null {
  const owner = token.balances?.[0]?.owner ?? token.owner ?? null;
  if (owner) return { href: `/account/${owner}`, label: "View owner" };
  const attributes = Array.isArray(token.metadata?.attributes) ? (token.metadata.attributes as { trait_type?: string; value?: unknown }[]) : [];
  const creator = attributes.find((a) => a.trait_type === "Creator")?.value;
  return typeof creator === "string" && creator ? { href: `/account/${creator}`, label: "View creator" } : null;
}
