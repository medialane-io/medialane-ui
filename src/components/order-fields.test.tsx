import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { useForm } from "react-hook-form";
import { Form } from "./form.js";
import { OrderFields, type OrderFieldsProps } from "./order-fields.js";
import type { OrderFormValues } from "../utils/order-form.js";

const options = [
  { label: "30 Days", seconds: 2592000 },
  { label: "2 Years", seconds: 63072000 },
];

function Harness(props: Omit<OrderFieldsProps, "form">) {
  const form = useForm<OrderFormValues>({ defaultValues: { price: "", currency: "USDC", durationSeconds: 63072000, amount: "1" } });
  return (
    <Form {...form}>
      <OrderFields form={form} {...props} />
    </Form>
  );
}

const base = { durationOptions: options, busy: false, priceLabel: "Price" };

test("shows the price label, the currency buttons and the durations", () => {
  const html = renderToStaticMarkup(<Harness {...base} />);
  expect(html).toContain("Price");
  expect(html).toContain("USDC");
  expect(html).toContain("2 Years");
});

test("has no quantity row unless quantity is given", () => {
  expect(renderToStaticMarkup(<Harness {...base} />)).not.toContain("Quantity");
  expect(renderToStaticMarkup(<Harness {...base} quantity={{}} />)).toContain("Quantity");
});

test("shows how many the owner holds", () => {
  expect(renderToStaticMarkup(<Harness {...base} quantity={{ owned: 5 }} />)).toContain("You own 5");
});

test("disables every control while busy", () => {
  const html = renderToStaticMarkup(<Harness {...base} busy />);
  expect(html.match(/disabled=""/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
});
