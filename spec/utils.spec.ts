import { slugify } from "../server/utils";

describe("slugify", () => {
  it("should convert text to lowercase", () => {
    expect(slugify("HELLO WORLD")).toBe("hello-world");
  });

  it("should trim whitespace", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  it("should replace spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  it("should remove non-word characters", () => {
    expect(slugify("hello world!")).toBe("hello-world");
  });

  it("should replace multiple hyphens with a single hyphen", () => {
    expect(slugify("hello--world")).toBe("hello-world");
  });

  it("should trim hyphens from start and end", () => {
    expect(slugify("-hello-world-")).toBe("hello-world");
  });

  it("should handle empty strings", () => {
    expect(slugify("")).toBe("");
  });
});
