import { describe, expect, it } from "vitest";

import { formatGroupCount } from "./plural";

describe("formatGroupCount", () => {
  it("uses singular for one", () => {
    expect(formatGroupCount(1)).toBe("1 grupa");
  });

  it("uses few form for 2-4", () => {
    expect(formatGroupCount(2)).toBe("2 grupy");
    expect(formatGroupCount(3)).toBe("3 grupy");
    expect(formatGroupCount(4)).toBe("4 grupy");
  });

  it("uses many form for zero and 5+", () => {
    expect(formatGroupCount(0)).toBe("0 grup");
    expect(formatGroupCount(5)).toBe("5 grup");
    expect(formatGroupCount(11)).toBe("11 grup");
    expect(formatGroupCount(21)).toBe("21 grup");
  });

  it("uses few form for 22-24", () => {
    expect(formatGroupCount(22)).toBe("22 grupy");
    expect(formatGroupCount(24)).toBe("24 grupy");
  });
});
