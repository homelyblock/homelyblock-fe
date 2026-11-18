import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterServicesByName, telHref, whatsappHref } from "./links.ts";
import { serviceFormSchema } from "./schemas.ts";

describe("serviceFormSchema", () => {
  it("accepts a valid provider payload", () => {
    const parsed = serviceFormSchema.safeParse({
      name: "Shinde Plumbing",
      category: "PLUMBING",
      phone: "+919876543210",
      whatsappNumber: "+919876543210",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects short names and invalid phones", () => {
    const parsed = serviceFormSchema.safeParse({
      name: "A",
      category: "OTHER",
      phone: "abc",
    });
    assert.equal(parsed.success, false);
  });
});

describe("service link helpers", () => {
  it("builds tel and WhatsApp links from phone numbers", () => {
    assert.equal(telHref("+91 98765-43210"), "tel:+919876543210");
    assert.equal(whatsappHref("+91 98765-43210"), "https://wa.me/919876543210");
  });

  it("filters providers by name locally", () => {
    const items = [
      { name: "Shinde Plumbing" },
      { name: "Patil Electrical" },
    ];
    assert.deepEqual(filterServicesByName(items, "plumb"), [
      { name: "Shinde Plumbing" },
    ]);
  });
});
