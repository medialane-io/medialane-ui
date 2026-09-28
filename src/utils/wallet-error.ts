
export class WrongNetworkError extends Error {
  constructor() {
    super("Your wallet is connected to the wrong network.");
    this.name = "WrongNetworkError";
  }
}

export function isWrongNetwork(
  chainId: bigint | string | undefined,
  expectedChainId: string,
): boolean {
  return chainId != null && BigInt(chainId).toString() !== expectedChainId;
}

export function assertCorrectNetwork(
  chainId: bigint | string | undefined,
  expectedChainId: string,
): void {
  if (isWrongNetwork(chainId, expectedChainId)) {
    throw new WrongNetworkError();
  }
}

export function collectErrorText(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const source = error as Record<string, unknown>;
    const parts: string[] = [];

    for (const key of ["message", "name", "code", "shortMessage"]) {
      const value = source[key];
      if (value !== undefined) parts.push(String(value));
    }

    const messages = source.errorMessages;
    if (messages && typeof messages === "object") {
      parts.push(...Object.values(messages).map(String));
    }

    return parts.join(" ");
  }

  return String(error);
}

export function isBareExecuteFailure(error: unknown): boolean {
  return collectErrorText(error).trim().toLowerCase() === "execute failed";
}

export function isUserRejectedRequest(error: unknown): boolean {
  const text = collectErrorText(error).toLowerCase();
  return (
    text.includes("user_refused_op") ||
    text.includes("user refused") ||
    text.includes("user rejected") ||
    text.includes("user abort") ||
    text.includes("user denied") ||
    text.includes("request rejected") ||
    text.includes("rejected by user") ||
    text.includes("cancelled") ||
    text.includes("canceled") ||
    isBareExecuteFailure(error)
  );
}


