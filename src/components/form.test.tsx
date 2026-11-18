import { expect, test } from "bun:test";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { render, waitFor } from "@testing-library/react";
import { Form, FormField, FormItem, FormMessage } from "./form.js";
import { I18nProvider } from "../i18n/provider.js";

function Fixture() {
  const form = useForm({ defaultValues: { name: "" } });
  useEffect(() => {
    form.setError("name", { message: "Name required" });
  }, [form]);
  return (
    <Form {...form}>
      <FormField control={form.control} name="name" render={() => <FormItem><FormMessage /></FormItem>} />
    </Form>
  );
}

test("a field error shows as written without a provider", async () => {
  const { container } = render(<Fixture />);
  await waitFor(() => expect(container.textContent).toBe("Name required"));
});

test("a field error shows its translation under a provider", async () => {
  const { container } = render(
    <I18nProvider locale="pt" messages={{ "Name required": "Nome obrigatório" }}>
      <Fixture />
    </I18nProvider>,
  );
  await waitFor(() => expect(container.textContent).toBe("Nome obrigatório"));
});
