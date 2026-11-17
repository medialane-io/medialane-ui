import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { MedialaneAppContext } from "./medialane-app.js";
import Image from "./image.js";

afterEach(cleanup);

const IPFS = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/1.png";

function withResolver(resolveImage: (uri: string | null | undefined) => string | null, children: React.ReactNode) {
  return <MedialaneAppContext.Provider value={{ resolveImage } as never}>{children}</MedialaneAppContext.Provider>;
}

test("an ipfs link is passed through the app's image resolver, which a browser cannot load otherwise", () => {
  const resolve = mock((uri: string | null | undefined) => (uri ? `https://gateway.test/${uri.slice(7)}` : null));
  render(withResolver(resolve, <Image src={IPFS} alt="a" width={10} height={10} unoptimized />));
  expect(resolve).toHaveBeenCalledWith(IPFS);
});

test("any other address is left exactly as given", () => {
  const resolve = mock((uri: string | null | undefined) => uri ?? null);
  render(withResolver(resolve, <Image src="/api/img?url=x" alt="a" width={10} height={10} unoptimized />));
  render(withResolver(resolve, <Image src="https://example.com/a.png" alt="a" width={10} height={10} unoptimized />));
  expect(resolve).not.toHaveBeenCalled();
});
