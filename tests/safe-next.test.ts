import { describe, it, expect } from "vitest";
import { safeNext } from "@/lib/safe-next";

describe("safeNext open redirect protection", () => {
  it("allows valid relative paths starting with single slash", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("/match?treatment=knee")).toBe("/match?treatment=knee");
    expect(safeNext("/coordinator")).toBe("/coordinator");
    expect(safeNext("/hospitals/aravali")).toBe("/hospitals/aravali");
  });

  it("returns fallback for null, undefined, or empty values", () => {
    expect(safeNext(null)).toBe("/dashboard");
    expect(safeNext(undefined)).toBe("/dashboard");
    expect(safeNext("")).toBe("/dashboard");
    expect(safeNext("   ")).toBe("/dashboard");
    expect(safeNext(null, "/")).toBe("/");
  });

  it("blocks protocol-relative URLs starting with //", () => {
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("//evil.com/path")).toBe("/dashboard");
  });

  it("blocks paths starting with /\\ or containing backslashes", () => {
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("/path\\to\\somewhere")).toBe("/dashboard");
  });

  it("blocks absolute URLs with protocols (http, https, javascript, data)", () => {
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext("http://attacker.com/login")).toBe("/dashboard");
    expect(safeNext("javascript:alert(1)")).toBe("/dashboard");
    expect(safeNext("data:text/html,<script>alert(1)</script>")).toBe("/dashboard");
  });

  it("blocks redirects to /login to prevent infinite loops", () => {
    expect(safeNext("/login")).toBe("/dashboard");
    expect(safeNext("/login/")).toBe("/dashboard");
    expect(safeNext("/login?next=/dashboard")).toBe("/dashboard");
  });
});
