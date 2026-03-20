import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { outputJson, outputResult } from "./output";

describe("outputJson", () => {
  let writtenData: string[];
  const origWrite = process.stdout.write;

  beforeEach(() => {
    writtenData = [];
    process.stdout.write = ((data: string) => {
      writtenData.push(data);
      return true;
    }) as typeof process.stdout.write;
  });

  afterEach(() => {
    process.stdout.write = origWrite;
  });

  it("outputs full JSON when no fields specified", () => {
    outputJson({ a: 1, b: 2 });
    const output = writtenData.join("");
    const parsed = JSON.parse(output);
    expect(parsed).toEqual({ a: 1, b: 2 });
  });

  it("filters fields when specified", () => {
    outputJson({ a: 1, b: 2, c: 3 }, "a,c");
    const output = writtenData.join("");
    const parsed = JSON.parse(output);
    expect(parsed).toEqual({ a: 1, c: 3 });
  });

  it("filters array items", () => {
    outputJson(
      [
        { a: 1, b: 2 },
        { a: 3, b: 4 },
      ],
      "a",
    );
    const output = writtenData.join("");
    const parsed = JSON.parse(output);
    expect(parsed).toEqual([{ a: 1 }, { a: 3 }]);
  });
});

describe("outputResult", () => {
  it("calls defaultFormat when json is undefined", () => {
    const formatFn = mock(() => {});
    outputResult({ x: 1 }, undefined, formatFn);
    expect(formatFn).toHaveBeenCalledWith({ x: 1 });
  });

  it("outputs JSON when json flag is set", () => {
    const writtenData: string[] = [];
    const origWrite = process.stdout.write;
    process.stdout.write = ((data: string) => {
      writtenData.push(data);
      return true;
    }) as typeof process.stdout.write;

    const formatFn = mock(() => {});
    outputResult({ x: 1 }, "", formatFn);

    process.stdout.write = origWrite;
    expect(formatFn).not.toHaveBeenCalled();
    const output = writtenData.join("");
    expect(JSON.parse(output)).toEqual({ x: 1 });
  });
});
