import { afterEach, expect, test } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { Form } from "./form.js";
import { ExternalLinkField } from "./external-link-field.js";

afterEach(cleanup);

function Harness({ address, initial = "" }: { address: string | null; initial?: string }) {
  const form = useForm({ defaultValues: { external_link: initial } });
  return (
    <Form {...form}>
      <ExternalLinkField form={form} address={address} />
    </Form>
  );
}

const input = (view: ReturnType<typeof render>) => view.getByPlaceholderText("https://yourwebsite.com") as HTMLInputElement;

test("the link starts as the account page of the connected wallet", async () => {
  const view = render(<Harness address="0xabc" />);
  await waitFor(() => expect(input(view).value).toBe("https://www.medialane.io/account/0xabc"));
});

test("a link already typed is kept", async () => {
  const view = render(<Harness address="0xabc" initial="https://me.example" />);
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(input(view).value).toBe("https://me.example");
});

test("without a wallet the field stays empty", async () => {
  const view = render(<Harness address={null} />);
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(input(view).value).toBe("");
});
