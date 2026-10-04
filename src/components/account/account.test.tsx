import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Shield } from "lucide-react";
import { AccountSection } from "./account-section.js";
import { EmailCodeEntry } from "./email-code-entry.js";
import { DevicesSection } from "./devices-section.js";
import { GuardianRecoverySection } from "./guardian-recovery-section.js";
import { initialEmailCodeState, type EmailCodeState } from "../../utils/email-code.js";
import type { EmailCode } from "../../utils/use-email-code.js";

const emailCode = (state: Partial<EmailCodeState>): EmailCode => ({
  state: { ...initialEmailCodeState, ...state },
  setCode: () => {},
  send: async () => true,
  fail: () => {},
  verify: async () => true,
  markReady: () => {},
});

const wallet = {
  getOwners: async () => [],
  addDevice: async () => "",
  removeDevice: async () => "",
  getGuardians: async () => [],
  getEscape: async () => ({ escapeType: "None", status: "None", readyAt: 0 }),
  setFirstGuardian: async () => "",
  cancelEscape: async () => "",
} as never;

describe("an account section", () => {
  test("shows its title, description and content", () => {
    const html = renderToStaticMarkup(
      <AccountSection icon={Shield} title="Devices" description="Who can sign">
        <p>content</p>
      </AccountSection>,
    );
    expect(html).toContain("Devices");
    expect(html).toContain("Who can sign");
    expect(html).toContain("content");
  });
});

describe("the email code entry", () => {
  test("says the code is being sent", () => {
    expect(renderToStaticMarkup(<EmailCodeEntry emailCode={emailCode({ status: "sending" })} onVerify={() => {}} />)).toContain("Sending code");
  });

  test("shows an error", () => {
    const html = renderToStaticMarkup(<EmailCodeEntry emailCode={emailCode({ status: "ready", error: "Incorrect code" })} onVerify={() => {}} />);
    expect(html).toContain("Incorrect code");
  });

  test("counts down before the code can be sent again", () => {
    const html = renderToStaticMarkup(<EmailCodeEntry emailCode={emailCode({ status: "ready", cooldown: 30 })} onVerify={() => {}} />);
    expect(html).toContain("resend in 30s");
    expect(html).not.toContain("resend the code");
  });

  test("offers a resend once the cooldown is over, and keeps verify off until six digits", () => {
    const html = renderToStaticMarkup(<EmailCodeEntry emailCode={emailCode({ status: "ready", cooldown: 0, code: "123" })} onVerify={() => {}} />);
    expect(html).toContain("resend the code");
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*Verify/);
  });
});

describe("the devices section", () => {
  test("starts with its heading and the add button while devices load", () => {
    const html = renderToStaticMarkup(<DevicesSection walletAddress="0x1" wallet={wallet} loadSealed={() => null} />);
    expect(html).toContain("Your devices");
    expect(html).toContain("Add");
  });
});

describe("the guardian recovery section", () => {
  test("links to the app's recovery page", () => {
    const html = renderToStaticMarkup(
      <GuardianRecoverySection walletAddress="0x1" wallet={wallet} loadSealed={() => null} guardianRecoveryAvailable recoverHref="/settings/recovery" />,
    );
    expect(html).toContain("Guardian recovery");
    expect(html).toContain('href="/settings/recovery"');
  });

  test("defaults the recovery link to /recover", () => {
    const html = renderToStaticMarkup(
      <GuardianRecoverySection walletAddress="0x1" wallet={wallet} loadSealed={() => null} guardianRecoveryAvailable={false} />,
    );
    expect(html).toContain('href="/recover"');
  });
});
