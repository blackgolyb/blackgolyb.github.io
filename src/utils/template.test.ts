import { describe, expect, it } from "vitest";
import { renderTemplate } from "./template";

describe("renderTemplate", () => {
  it("renders nested context values", () => {
    const rendered = renderTemplate("Hello {{ user.name }}", {
      user: { name: "Alice" },
    });

    expect(rendered).toBe("Hello Alice");
  });

  it("applies color filters to context values", () => {
    const rendered = renderTemplate("{{ name | cyan }}", { name: "Alice" });

    expect(rendered).toBe("\x1b[36mAlice\x1b[0m");
  });

  it("applies filters to quoted literal input", () => {
    const rendered = renderTemplate('{{ "<help>" | cyan }}', {});

    expect(rendered).toBe("\x1b[36m<help>\x1b[0m");
  });

  it("chains filters", () => {
    const rendered = renderTemplate("{{ name | cyan | bold }}", {
      name: "Alice",
    });

    expect(rendered).toBe("\x1b[1m\x1b[36mAlice\x1b[0m\x1b[0m");
  });

  it("renders missing values as empty strings", () => {
    const rendered = renderTemplate("Hello {{ missing }}", {});

    expect(rendered).toBe("Hello ");
  });
});
