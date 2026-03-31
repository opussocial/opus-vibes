import { registerSchema, loginSchema, typeSchema, interactionSchema } from "../server/validation";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should validate a correct registration object", () => {
      const validData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123"
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail if username is too short", () => {
      const invalidData = {
        username: "te",
        email: "test@example.com",
        password: "password123"
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail if email is invalid", () => {
      const invalidData = {
        username: "testuser",
        email: "invalid-email",
        password: "password123"
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail if password is too short", () => {
      const invalidData = {
        username: "testuser",
        email: "test@example.com",
        password: "pass"
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("typeSchema", () => {
    it("should validate a correct type object", () => {
      const validData = {
        name: "Test Type",
        description: "A test type",
        properties: [
          { table_name: "content", label: "Description" }
        ]
      };
      const result = typeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail if name is too short", () => {
      const invalidData = {
        name: "T",
        properties: []
      };
      const result = typeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail if properties are missing", () => {
      const invalidData = {
        name: "Test Type"
      };
      const result = typeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("interactionSchema", () => {
    it("should validate a correct interaction object", () => {
      const validData = {
        type_id: 1,
        content: "Nice work!"
      };
      const result = interactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail if type_id is missing", () => {
      const invalidData = {
        content: "Nice work!"
      };
      const result = interactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should validate a correct login object", () => {
      const validData = {
        username: "testuser",
        password: "password123"
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail if username is missing", () => {
      const invalidData = {
        password: "password123"
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail if password is missing", () => {
      const invalidData = {
        username: "testuser"
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
