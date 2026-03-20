import { describe, it, expect } from "bun:test";
import { formatTable } from "./table";

describe("formatTable", () => {
  it("formats headers and rows with proper alignment", () => {
    const result = formatTable(
      ["ID", "NAME", "TYPE"],
      [
        ["1", "My Folder", "normal"],
        ["23", "Another", "shared"],
      ],
    );

    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("ID");
    expect(lines[0]).toContain("NAME");
    expect(lines[0]).toContain("TYPE");
    expect(lines[1]).toContain("My Folder");
    expect(lines[2]).toContain("Another");
  });

  it("handles empty rows", () => {
    const result = formatTable(["A", "B"], []);
    expect(result).toBe("A  B");
  });

  it("pads columns to widest value", () => {
    const result = formatTable(["X"], [["short"], ["much longer value"]]);
    const lines = result.split("\n");
    // Header "X" should be padded to match "much longer value"
    expect(lines[0].length).toBe(lines[2].length);
  });
});
